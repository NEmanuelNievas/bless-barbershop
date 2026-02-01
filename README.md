# ✂️ Bless Barbershop - Sistema de Gestión Integral

> **Sistema completo de gestión para barberías desarrollado con JavaScript vanilla, Firebase y diseño moderno con Tailwind CSS.**

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firestore](https://img.shields.io/badge/Firestore-1976D2?style=flat&logo=google-cloud&logoColor=white)](https://firebase.google.com/products/firestore)

---

## 📋 Descripción del Proyecto

**Bless Barbershop** es una aplicación web completa diseñada para optimizar la gestión operativa de barberías. El sistema permite controlar clientes, servicios, transacciones, gastos y rendimiento de empleados con una interfaz moderna e intuitiva.

### 🎯 Características Destacadas

✨ **Sistema de Comisiones Inteligente**  
Implementación de **lógica avanzada en JavaScript puro** para calcular comisiones variables por barbero basadas en:
- Porcentaje configurable dinámicamente
- Montos de servicios personalizados
- Múltiples servicios por transacción
- Generación automática de reportes de rendimiento

💾 **Backend Robusto con Firebase**
- **Firestore Database** para almacenamiento NoSQL escalable
- **Firebase Storage** para gestión de imágenes y comprobantes
- **Firebase Authentication** para control de accesos
- **Firebase Hosting** para deployment instantáneo

🎨 **Diseño Moderno y Responsivo**
- UI construida con **Tailwind CSS**
- Interfaz adaptable a móviles, tablets y escritorio
- Sistema de colores profesional con azul corporativo
- Iconografía SVG personalizada

---

## 🚀 Funcionalidades Principales

### 👨‍💼 Panel de Administrador

| Módulo | Descripción |
|--------|-------------|
| **💰 Cobranza** | Registro de cortes y servicios con generación automática de tickets de pago, cálculo de totales y persistencia en Firestore |
| **📊 Rendimiento** | Dashboard con métricas en tiempo real: comisiones ganadas por barbero, cantidad de cortes, gastos e ingresos por ventas adicionales |
| **💵 Gestión de Gastos** | Control de gastos con categorías, comprobantes fotográficos en Firebase Storage y validación de tamaños (máx. 5MB) |
| **👥 Base de Clientes** | CRUD completo de clientes con fotos de perfil, historial de servicios y sincronización en tiempo real |
| **✂️ Edición de Precios** | Administración dinámica de servicios y precios con actualización instantánea en toda la aplicación |
| **📅 Turnos** | Sistema de gestión de citas y horarios de barberos |
| **👨‍👨‍👦 Control de Usuarios** | Administración de permisos y roles (Admin/Empleado) |

### 🧑‍🔧 Panel de Empleado

- Acceso limitado a funciones operativas básicas
- Registro de servicios y cobranza
- Consulta de clientes
- Visualización de rendimiento personal

---

## 🧮 Lógica de Cálculo de Comisiones

Una de las características más destacadas del proyecto es el **sistema de comisiones con JavaScript vanilla**, que permite:

### Algoritmo de Comisiones

```javascript
// Cálculo dinámico de comisiones por barbero
function calcularComisionBarbero(operador, transacciones, porcentajeComision) {
    const cortesRealizados = transacciones.filter(t => t.operador === operador);
    const totalGenerado = cortesRealizados.reduce((sum, t) => sum + parseFloat(t.monto), 0);
    const comision = (totalGenerado * porcentajeComision) / 100;
    
    return {
        barbero: operador,
        cortes: cortesRealizados.length,
        ingresosGenerados: totalGenerado,
        comisionGanada: comision
    };
}
```

### 💡 Características de la Lógica de Comisiones

- ✅ **Porcentaje configurable en tiempo real** desde el panel de administración
- ✅ **Cálculo automático** al registrar cada transacción
- ✅ **Filtrado por período** (día, semana, mes personalizado)
- ✅ **Soporte para múltiples servicios** por transacción
- ✅ **Reportes detallados** por barbero con totales y promedios
- ✅ **Exportación a Excel** con librería SheetJS

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3 / Tailwind CSS** - Diseño responsive y moderno
- **JavaScript ES6+** - Lógica de negocio con módulos nativos
- **SheetJS (xlsx)** - Exportación de datos a Excel

### Backend
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Storage** - Almacenamiento de archivos
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Hosting** - Deployment y hosting

### Herramientas
- **Firebase CLI** - Deployment automatizado
- **Git** - Control de versiones
- **VS Code** - Entorno de desarrollo

---

## 📂 Estructura del Proyecto

```
📦 Bless Barbershop
├── 📁 Admin Def/                    # Panel de Administrador
│   ├── login.html                   # Sistema de autenticación
│   ├── index_admin.html             # Dashboard principal admin
│   ├── cobranza.html                # Módulo de cobranza y tickets
│   ├── rendimiento.html             # Dashboard de métricas y comisiones
│   ├── gastos_admin.html            # Gestión de gastos con comprobantes
│   ├── agregar_clientes.html        # CRUD de clientes
│   ├── editar_precios.html          # Gestión de servicios y precios
│   ├── turnos.html                  # Sistema de citas
│   ├── control_usuarios.html        # Administración de usuarios
│   ├── migrate-data.html            # Herramienta de migración
│   ├── firebase-config.js           # API centralizada de Firebase
│   └── styles_shared.css            # Estilos compartidos
│
├── 📁 Barberos/                     # Panel de Empleados
│   └── [Archivos similares con permisos limitados]
│
├── 📁 Configuración
│   ├── firebase.json                # Configuración de hosting
│   ├── .firebaserc                  # Proyecto Firebase
│   ├── firestore.rules              # Reglas de seguridad Firestore
│   ├── firestore.indexes.json       # Índices compuestos
│   └── storage.rules                # Reglas de seguridad Storage
│
└── 📁 Documentación
    ├── README.md                    # Este archivo
    ├── PROJECT_SUMMARY.md           # Resumen técnico del proyecto
    ├── DEPLOYMENT_GUIDE.md          # Guía de deployment
    └── CREDENCIALES.md              # Usuarios y contraseñas
```

---

## 🔥 Arquitectura Firebase

### Colecciones de Firestore

| Colección | Descripción | Campos Principales |
|-----------|-------------|-------------------|
| `services` | Servicios y precios | `name`, `price`, `timestamp` |
| `transactions` | Registro de cobranzas | `monto`, `servicios[]`, `operador`, `metodoPago`, `fecha` |
| `expenses` | Gastos del negocio | `amount`, `category`, `description`, `receipt`, `date` |
| `clients` | Base de clientes | `name`, `phone`, `email`, `photo`, `lastVisit` |
| `settings` | Configuraciones | `lastOperator`, `commissionRate` |

### Reglas de Seguridad

```javascript
// Firestore Rules - Auditoría y protección de datos
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;  // 🔒 Inmutables (auditoría)
    }
    
    match /expenses/{expenseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;  // 🔒 Inmutables (auditoría)
    }
    
    match /services/{serviceId} {
      allow read, write: if request.auth != null;  // ✅ CRUD completo
    }
  }
}
```

---

## 🚀 Instalación y Deployment

### Requisitos Previos

- Node.js v14+ y npm
- Cuenta de Firebase
- Git

### Pasos de Instalación

1️⃣ **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/bless-barbershop.git
cd bless-barbershop
```

2️⃣ **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

3️⃣ **Iniciar sesión en Firebase**
```bash
firebase login
```

4️⃣ **Configurar Firebase**
- Editar `Admin Def/firebase-config.js` con tus credenciales:
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "TU_APP_ID"
};
```

5️⃣ **Desplegar en Firebase Hosting**
```bash
firebase deploy
```

6️⃣ **Acceder a la aplicación**
```
https://tu-proyecto.web.app
```

---

## 🔐 Credenciales de Acceso

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `adminpassword`
- **Permisos:** Acceso total al sistema

### Barbero/Empleado
- **Usuario:** `barbero1`
- **Contraseña:** `barberopassword`
- **Permisos:** Funciones operativas básicas

> ⚠️ **Nota de Seguridad:** Cambiar estas credenciales en producción mediante Firebase Authentication.

---

## 📸 Capturas de Pantalla

### Dashboard de Administrador
![Dashboard Admin](https://via.placeholder.com/800x400/2563EB/FFFFFF?text=Dashboard+de+Administrador)

### Panel de Cobranza
![Cobranza](https://via.placeholder.com/800x400/10B981/FFFFFF?text=M%C3%B3dulo+de+Cobranza)

### Rendimiento y Comisiones
![Rendimiento](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Dashboard+de+Rendimiento)

---

## 🎓 Aprendizajes Clave del Proyecto

### 💻 JavaScript Avanzado
- Programación funcional con `map()`, `filter()`, `reduce()`
- Promesas y async/await para operaciones asíncronas
- Módulos ES6 para organización de código
- Manipulación del DOM de manera eficiente
- Event listeners y delegación de eventos

### 🔥 Firebase
- Integración completa de Firestore Database
- Operaciones CRUD en tiempo real
- Listeners de cambios con `onSnapshot()`
- Gestión de archivos en Storage con validaciones
- Deployment y hosting profesional
- Configuración de reglas de seguridad

### 🎨 UI/UX
- Diseño responsive mobile-first
- Sistema de diseño consistente con Tailwind CSS
- Generación de tickets de pago imprimibles
- Modales y componentes interactivos
- Validaciones en tiempo real con feedback visual

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Emanuel Nievas**

- 💼 Desarrollador Full Stack
- 🔥 Especialista en Firebase y JavaScript
- 📧 Email: emanuel.nievas@example.com
- 🌐 Portfolio: [tu-portfolio.com](https://tu-portfolio.com)

---

## 🙏 Agradecimientos

- Firebase por su plataforma robusta y documentación
- Tailwind CSS por el framework de diseño
- SheetJS por la librería de exportación a Excel
- La comunidad de desarrolladores JavaScript

---

## 📚 Recursos Adicionales

- [Documentación Firebase](https://firebase.google.com/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)

---

<div align="center">

**⭐ Si te gustó este proyecto, dale una estrella en GitHub ⭐**

Hecho con ❤️ y ☕ por Emanuel Nievas

</div>
