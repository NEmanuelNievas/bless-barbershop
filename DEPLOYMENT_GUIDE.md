# 🚀 Guía de Deployment a Firebase Hosting

## ✅ Archivos de Configuración Creados

Se han creado los siguientes archivos de configuración en el workspace:

### 1. **firebase.json**
- Configura el directorio público como "Admin Def"
- Define rewrites para redirigir todo al login.html
- Configura referencias a reglas de Firestore y Storage

### 2. **.firebaserc**
- Define el proyecto por defecto: `barberia-bless`

### 3. **firestore.rules**
- Reglas de seguridad para Firestore
- Solo usuarios autenticados pueden acceder a los datos
- Previene modificación/eliminación de transacciones y gastos (auditoría)
- Permite CRUD completo en servicios, clientes y configuraciones

### 4. **storage.rules**
- Reglas de seguridad para Firebase Storage
- Solo usuarios autenticados pueden subir/leer archivos
- Validación de tamaño máximo: 5MB
- Validación de tipo: solo imágenes
- Los comprobantes no se pueden eliminar (auditoría)
- Las fotos de clientes sí se pueden eliminar

### 5. **firestore.indexes.json**
- Índices compuestos para consultas eficientes
- Índice en transactions: fecha (desc) + operador (asc)
- Índice en expenses: fecha (desc) + category (asc)

### 6. **.gitignore**
- Excluye archivos de Firebase, node_modules, y archivos del sistema

---

## 📋 Pasos para Completar el Deployment

### Paso 1: Iniciar sesión en Firebase

En la terminal de PowerShell, ejecuta:

```powershell
firebase login --no-localhost
```

Responde las preguntas:
1. **Enable Gemini in Firebase features?** → Presiona `n` (No)
2. Se abrirá un navegador o se mostrará un enlace
3. Inicia sesión con la cuenta de Google asociada al proyecto Firebase
4. Copia el código de autorización que aparece
5. Pégalo en la terminal y presiona Enter

### Paso 2: Habilitar Firebase Storage (Solo primera vez)

Si es la primera vez usando Firebase Storage, debes habilitarlo:

1. Ve a [Firebase Console - Storage](https://console.firebase.google.com/project/barberia-bless/storage)
2. Haz clic en "Get Started" o "Comenzar"
3. Acepta las reglas predeterminadas (las reemplazaremos después)
4. Selecciona la ubicación (recomendado: southamerica-east1 para Argentina)
5. Haz clic en "Listo" o "Done"

### Paso 3: Desplegar las Reglas de Seguridad

Una vez habilitado Storage, despliega las reglas de Firestore y Storage:

```powershell
firebase deploy --only firestore:rules,storage:rules
```

Esto aplicará las reglas de seguridad sin desplegar el sitio web aún.

### Paso 4: (Opcional) Desplegar el Sitio Web

Si deseas hospedar la aplicación en Firebase Hosting:

```powershell
firebase deploy --only hosting
```

Tu aplicación estará disponible en:
**https://barberia-bless.web.app**

### Paso 5: Verificar el Deployment

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona el proyecto "barberia-bless"
3. Verifica:
   - **Firestore Database** → Pestaña "Reglas" → Las reglas deben estar activas
   - **Storage** → Pestaña "Reglas" → Las reglas deben estar activas
   - **Hosting** (si desplegaste) → URL del sitio activo

---

## 🔐 Resumen de Reglas de Seguridad

### Firestore Database

| Colección | Leer | Crear | Actualizar | Eliminar |
|-----------|------|-------|------------|----------|
| services | ✅ | ✅ | ✅ | ✅ |
| transactions | ✅ | ✅ | ❌ | ❌ |
| expenses | ✅ | ✅ | ❌ | ❌ |
| clients | ✅ | ✅ | ✅ | ✅ |
| settings | ✅ | ✅ | ✅ | ✅ |

**Nota:** Solo usuarios autenticados tienen acceso.

### Firebase Storage

| Carpeta | Subir | Leer | Eliminar |
|---------|-------|------|----------|
| /receipts/* | ✅ (max 5MB, solo imágenes) | ✅ | ❌ |
| /clients/* | ✅ (max 5MB, solo imágenes) | ✅ | ✅ |

**Nota:** Solo usuarios autenticados tienen acceso.

---

## 🔄 Migración de Datos Locales

Antes de usar la aplicación en producción, ejecuta la herramienta de migración:

1. Abre **migrate-data.html** en el navegador
2. Haz clic en "Iniciar Migración"
3. Espera a que todos los datos se migren de localStorage a Firestore
4. Verifica que los contadores muestren los datos correctamente

---

## 🛠️ Comandos Útiles de Firebase CLI

```powershell
# Ver lista de proyectos
firebase projects:list

# Cambiar proyecto activo
firebase use barberia-bless

# Ver estado del proyecto
firebase status

# Desplegar solo Firestore
firebase deploy --only firestore

# Desplegar solo Storage
firebase deploy --only storage

# Desplegar solo Hosting
firebase deploy --only hosting

# Desplegar todo
firebase deploy

# Ver logs
firebase functions:log
```

---

## 🎯 Siguiente Paso Recomendado

Una vez completado el deployment de las reglas de seguridad, prueba la aplicación:

1. Abre **login.html** en el navegador
2. Inicia sesión con tus credenciales
3. Prueba crear una transacción en **cobranza.html**
4. Verifica que los datos se guarden correctamente en Firestore
5. Prueba subir un comprobante en **gastos_admin.html**
6. Verifica que la imagen se suba a Firebase Storage

---

## ⚠️ Importante

- Las reglas de seguridad requieren autenticación. Asegúrate de haber configurado Firebase Authentication correctamente.
- Los comprobantes de gastos no se pueden eliminar para mantener auditoría.
- Las transacciones y gastos no se pueden editar ni eliminar una vez creados.
- El límite de tamaño de archivo es de 5MB.

---

## 📞 Soporte

Si encuentras algún problema durante el deployment:
1. Verifica que estás usando el proyecto correcto: `firebase use barberia-bless`
2. Revisa los logs de error en la terminal
3. Verifica las reglas en la consola de Firebase
4. Asegúrate de que Firebase Authentication esté habilitado

---

**Estado actual:** ✅ Archivos de configuración creados y listos para deployment.
**Próximo paso:** Ejecutar `firebase login --no-localhost` y seguir los pasos anteriores.
