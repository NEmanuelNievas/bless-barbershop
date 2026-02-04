/**
 * Módulo de Encriptación de Contraseñas
 * Utiliza SubtleCrypto API para hashear contraseñas de forma segura sin dependencias externas
 * Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)
 */

/**
 * Genera un hash seguro de una contraseña usando PBKDF2
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} Hash en formato Base64
 */
export async function hashPassword(password) {
    try {
        // 1. Convertir contraseña a Uint8Array
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        // 2. Importar la contraseña como clave PBKDF2
        const key = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // 3. Generar un salt aleatorio (16 bytes)
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        // 4. Derivar bits usando PBKDF2 con 100,000 iteraciones (estándar OWASP)
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            256 // 32 bytes
        );
        
        // 5. Combinar salt + hash y convertir a Base64
        const hashArray = new Uint8Array(derivedBits);
        const combined = new Uint8Array(salt.length + hashArray.length);
        combined.set(salt, 0);
        combined.set(hashArray, salt.length);
        
        // Convertir a string Base64
        const hashString = btoa(String.fromCharCode.apply(null, combined));
        
        return hashString;
    } catch (error) {
        console.error('Error al hashear contraseña:', error);
        throw error;
    }
}

/**
 * Valida una contraseña contra su hash almacenado
 * @param {string} password - Contraseña ingresada por el usuario
 * @param {string} storedHash - Hash almacenado en Firestore
 * @returns {Promise<boolean>} true si la contraseña es correcta, false en caso contrario
 */
export async function validatePassword(password, storedHash) {
    try {
        // 1. Decodificar el hash almacenado desde Base64
        const combined = new Uint8Array(atob(storedHash).split('').map(c => c.charCodeAt(0)));
        
        // 2. Extraer salt (primeros 16 bytes) y hash almacenado (últimos 32 bytes)
        const salt = combined.slice(0, 16);
        const storedHashArray = combined.slice(16);
        
        // 3. Convertir contraseña a Uint8Array
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        // 4. Importar la contraseña como clave PBKDF2
        const key = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        // 5. Derivar bits con el mismo salt y parámetros
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            256
        );
        
        // 6. Comparar bytes (comparación constante para evitar timing attacks)
        const computedHashArray = new Uint8Array(derivedBits);
        return constantTimeCompare(computedHashArray, storedHashArray);
    } catch (error) {
        console.error('Error al validar contraseña:', error);
        return false;
    }
}

/**
 * Comparación constante de dos Uint8Arrays para evitar timing attacks
 * @param {Uint8Array} a - Primer array
 * @param {Uint8Array} b - Segundo array
 * @returns {boolean} true si son iguales
 */
function constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

/**
 * Verifica si una contraseña ya está hasheada
 * Las contraseñas hasheadas tendrán formato Base64 largo (88+ caracteres)
 * @param {string} passwordOrHash - Contraseña o hash
 * @returns {boolean} true si parece ser un hash
 */
export function isPasswordHashed(passwordOrHash) {
    // Los hashes PBKDF2 con salt tienen al menos 88 caracteres en Base64
    if (!passwordOrHash || typeof passwordOrHash !== 'string') return false;
    return passwordOrHash.length > 80 && /^[A-Za-z0-9+/=]+$/.test(passwordOrHash);
}
