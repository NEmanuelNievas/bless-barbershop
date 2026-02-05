# 🔒 Guía de Seguridad - Bless Barbershop v3.0

## Archivos Ignorados en Git (Sensibles)

Los siguientes archivos contienen información sensible y NO están incluidos en el repositorio remoto:

### Configuración de Firebase
- `firebase-config.js` - Claves de API y credenciales de Firebase
- `.firebaserc` - Identificador del proyecto de Firebase
- `firebase.json` - Configuración de deployment

### Documentación Interna
- `CREDENCIALES.md` - Credenciales de usuarios de prueba
- `DEPLOYMENT_GUIDE.md` - Guía de deployment con información del proyecto
- `DEPLOYMENT_COMPLETE.md` - Logs de deployment
- `PROJECT_SUMMARY.md` - Resumen técnico del proyecto
- `SEARCH_FEATURE_SUMMARY.md` - Detalles de implementación de búsqueda
- `CHANGELOG_v2.0.md` - Historial de cambios anteriores

## Configuración Local

Para trabajar localmente, necesitas crear los archivos de configuración:

### 1. Crear `firebase-config.js`

Crea este archivo en ambos directorios:
- `Admin Def/firebase-config.js`
- `Barberos/firebase-config.js`

Usa `firebase-config.example.js` como plantilla.

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const appId = "YOUR_APP_ID";
// ... resto del archivo
```

## Prácticas de Seguridad Implementadas

✅ **Credenciales no expuestas**
- Las credenciales de Firebase están en `.gitignore`
- Las contraseñas no se guardan en archivos versionados
- Uso de variables de entorno para configuración

✅ **Autenticación Firebase**
- Sistema de autenticación mediante Firebase Auth
- Roles de usuario (admin/employee)
- Sesiones seguras

✅ **Reglas de Firestore**
- `firestore.rules` define permisos por rol
- Validación de datos en base de datos

✅ **Reglas de Storage**
- `storage.rules` controla acceso a archivos
- Validación de tamaño y tipo de archivo

## Cambios de Seguridad Recientes

### Commit: Remove hardcoded credentials
- Eliminadas credenciales hardcodeadas de `login.html`
- Reemplazadas con importación de archivo externo
- Credenciales de prueba cambiadas a valores genéricos

### Commit: Remove sensitive files from tracking
- `firebase-config.js` removido del histórico de Git
- Actualizado `.gitignore` con archivos sensibles
- Limpieza de documentación comprometida

## Acceso Remoto (GitHub)

El repositorio remoto en GitHub:
- ❌ NO contiene credenciales de Firebase
- ❌ NO contiene contraseñas de usuarios
- ❌ NO contiene información de configuración sensible
- ✅ SÍ contiene código fuente del sistema
- ✅ SÍ contiene lógica de negocio
- ✅ SÍ contiene reglas de seguridad de Firestore

## Procedimiento para Nuevos Colaboradores

1. Clonar el repositorio
2. Contactar al propietario para obtener `firebase-config.js`
3. Crear archivos locales de configuración
4. NO hacer commit de archivos de configuración

## Monitoreo de Seguridad

- Las credenciales están versionadas únicamente en local
- Cada desarrollador tiene su propia copia privada
- No hay riesgo de exposición en Git público

---

**Última actualización:** Febrero 5, 2026
**Versión:** 3.0
