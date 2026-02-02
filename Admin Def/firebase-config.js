/**
 * Configuración compartida de Firebase para Bless Barbershop
 * Este módulo se importa en todas las páginas que necesitan acceso a Firestore/Storage
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// --- Configuración de Firebase ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Inicialización ---
let app;
let db;
let auth;
let storage;
let initializationFailed = false;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("✅ Firebase inicializado correctamente");
} catch (error) {
    console.error("❌ Error al inicializar Firebase:", error);
    initializationFailed = true;
}

// --- Utilidades de Autenticación ---
export function requireAuth(redirectUrl = 'login.html') {
    return new Promise((resolve, reject) => {
        if (initializationFailed || !auth) {
            console.warn("⚠️ Firebase no disponible, usando modo local");
            resolve({ mode: 'local', uid: 'local-user' });
            return;
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve({ mode: 'firebase', uid: user.uid, user });
            } else {
                console.warn("⚠️ Usuario no autenticado, redirigiendo...");
                window.location.href = redirectUrl;
                reject(new Error('Not authenticated'));
            }
        });
    });
}

// --- API de Servicios (Precios) ---
export const servicesAPI = {
    // Obtener todos los servicios
    async getAll() {
        if (initializationFailed) return this._getLocalServices();
        
        const servicesRef = collection(db, 'services');
        const snapshot = await getDocs(servicesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Escuchar cambios en tiempo real
    onServicesChange(callback) {
        if (initializationFailed) return () => {};

        const servicesRef = collection(db, 'services');
        return onSnapshot(servicesRef, (snapshot) => {
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(services);
        });
    },

    // Crear/actualizar servicio
    async save(serviceName, price) {
        if (initializationFailed) return this._saveLocalService(serviceName, price);

        const serviceRef = doc(db, 'services', this._sanitizeId(serviceName));
        await setDoc(serviceRef, {
            name: serviceName,
            price: parseFloat(price),
            updatedAt: Timestamp.now()
        });
    },

    // Eliminar servicio
    async delete(serviceName) {
        if (initializationFailed) return this._deleteLocalService(serviceName);

        const serviceRef = doc(db, 'services', this._sanitizeId(serviceName));
        await deleteDoc(serviceRef);
    },

    // Inicializar precios por defecto
    async initDefaults() {
        const defaults = {
            'Corte estándar': 2500,
            'Corte con barba': 3500,
            'Corte V.I.P.': 5000,
            'Tintura': 4200,
            'Indumentaria': 1500
        };

        for (const [name, price] of Object.entries(defaults)) {
            await this.save(name, price);
        }
    },

    // Fallbacks locales
    _getLocalServices() {
        const stored = localStorage.getItem('servicePrices');
        if (!stored) return [];
        const prices = JSON.parse(stored);
        return Object.entries(prices).map(([name, price]) => ({ id: name, name, price }));
    },

    _saveLocalService(name, price) {
        const prices = JSON.parse(localStorage.getItem('servicePrices') || '{}');
        prices[name] = parseFloat(price);
        localStorage.setItem('servicePrices', JSON.stringify(prices));
    },

    _deleteLocalService(name) {
        const prices = JSON.parse(localStorage.getItem('servicePrices') || '{}');
        delete prices[name];
        localStorage.setItem('servicePrices', JSON.stringify(prices));
    },

    _sanitizeId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
};

// --- API de Transacciones (Cobranza) ---
export const transactionsAPI = {
    // Crear transacción
    async create(transaction) {
        if (initializationFailed) return this._createLocal(transaction);

        const transactionsRef = collection(db, 'transactions');
        const docRef = await addDoc(transactionsRef, {
            ...transaction,
            amount: parseFloat(transaction.monto || transaction.amount),
            createdAt: Timestamp.now(),
            fecha: transaction.fecha ? Timestamp.fromDate(new Date(transaction.fecha)) : Timestamp.now()
        });
        return docRef.id;
    },

    // Obtener todas las transacciones
    async getAll() {
        if (initializationFailed) return this._getAllLocal();

        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Filtrar por fecha
    async getByDateRange(startDate, endDate) {
        if (initializationFailed) return this._getAllLocal();

        const transactionsRef = collection(db, 'transactions');
        const q = query(
            transactionsRef,
            where('fecha', '>=', Timestamp.fromDate(startDate)),
            where('fecha', '<=', Timestamp.fromDate(endDate)),
            orderBy('fecha', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Fallbacks locales
    _createLocal(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactionsData') || '[]');
        transactions.push({ id: Date.now(), ...transaction });
        localStorage.setItem('transactionsData', JSON.stringify(transactions));
        return Date.now();
    },

    _getAllLocal() {
        return JSON.parse(localStorage.getItem('transactionsData') || '[]');
    }
};

// --- API de Gastos (Expenses) ---
export const expensesAPI = {
    // Crear gasto (con opción de subir comprobante)
    async create(expense, receiptFile = null) {
        if (initializationFailed) return this._createLocal(expense);

        let receiptURL = null;
        if (receiptFile) {
            receiptURL = await this._uploadReceipt(receiptFile);
        }

        const expensesRef = collection(db, 'expenses');
        const docRef = await addDoc(expensesRef, {
            amount: parseFloat(expense.monto || expense.amount),
            category: expense.categoria || expense.category,
            detail: expense.detalle || expense.detail,
            receiptURL,
            createdAt: Timestamp.now(),
            fecha: expense.fecha ? Timestamp.fromDate(new Date(expense.fecha)) : Timestamp.now()
        });
        return docRef.id;
    },

    // Subir comprobante a Storage
    async _uploadReceipt(file) {
        const filename = `receipts/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    // Obtener todos los gastos
    async getAll() {
        if (initializationFailed) return this._getAllLocal();

        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Fallbacks locales
    _createLocal(expense) {
        const expenses = JSON.parse(localStorage.getItem('expensesData') || '[]');
        expenses.push({ id: Date.now(), ...expense });
        localStorage.setItem('expensesData', JSON.stringify(expenses));
        return Date.now();
    },

    _getAllLocal() {
        return JSON.parse(localStorage.getItem('expensesData') || '[]');
    }
};

// --- API de Clientes ---
export const clientsAPI = {
    // Crear cliente (con foto)
    async create(client, photoFile = null) {
        if (initializationFailed) return this._createLocal(client);

        let photoURL = null;
        if (photoFile) {
            photoURL = await this._uploadPhoto(photoFile);
        }

        const clientsRef = collection(db, 'clients');
        const docRef = await addDoc(clientsRef, {
            name: client.name,
            dni: client.dni || '',
            address: client.address || '',
            phone: client.phone || '',
            birthday: client.birthday || '',
            photoURL,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    },

    // Subir foto a Storage
    async _uploadPhoto(file) {
        const filename = `clients/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    // Obtener todos los clientes
    async getAll() {
        if (initializationFailed) return this._getAllLocal();

        const clientsRef = collection(db, 'clients');
        const q = query(clientsRef, orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Actualizar cliente
    async update(clientId, clientData, photoFile = null) {
        if (initializationFailed) return this._updateLocal(clientId, clientData);

        let updateData = {
            name: clientData.name,
            dni: clientData.dni || '',
            address: clientData.address || '',
            phone: clientData.phone || '',
            birthday: clientData.birthday || '',
        };

        // Si se proporciona una nueva foto, actualizar
        if (photoFile) {
            updateData.photoURL = await this._uploadPhoto(photoFile);
        }

        const clientRef = doc(db, 'clients', clientId);
        await updateDoc(clientRef, updateData);
    },

    // Eliminar cliente
    async delete(clientId, photoURL = null) {
        if (initializationFailed) return this._deleteLocal(clientId);

        // Eliminar foto de Storage si existe
        if (photoURL && photoURL.includes('firebase')) {
            try {
                const photoRef = ref(storage, photoURL);
                await deleteObject(photoRef);
            } catch (error) {
                console.warn("No se pudo eliminar la foto:", error);
            }
        }

        const clientRef = doc(db, 'clients', clientId);
        await deleteDoc(clientRef);
    },

    // Fallbacks locales
    _createLocal(client) {
        const clients = JSON.parse(localStorage.getItem('clientsData') || '[]');
        clients.push({ id: Date.now(), ...client });
        localStorage.setItem('clientsData', JSON.stringify(clients));
        return Date.now();
    },

    _getAllLocal() {
        return JSON.parse(localStorage.getItem('clientsData') || '[]');
    },

    _updateLocal(clientId, clientData) {
        let clients = JSON.parse(localStorage.getItem('clientsData') || '[]');
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...clientData };
            localStorage.setItem('clientsData', JSON.stringify(clients));
        }
    },

    _deleteLocal(clientId) {
        let clients = JSON.parse(localStorage.getItem('clientsData') || '[]');
        clients = clients.filter(c => c.id !== clientId);
        localStorage.setItem('clientsData', JSON.stringify(clients));
    }
};

// --- API de Configuración ---
export const settingsAPI = {
    async get(key) {
        if (initializationFailed) return localStorage.getItem(key);

        const settingsRef = doc(db, 'settings', 'general');
        const snapshot = await getDoc(settingsRef);
        return snapshot.exists() ? snapshot.data()[key] : null;
    },

    async set(key, value) {
        if (initializationFailed) {
            localStorage.setItem(key, value);
            return;
        }

        const settingsRef = doc(db, 'settings', 'general');
        await setDoc(settingsRef, { [key]: value }, { merge: true });
    }
};

// --- Exportar instancias ---
export { app, db, auth, storage, initializationFailed };
