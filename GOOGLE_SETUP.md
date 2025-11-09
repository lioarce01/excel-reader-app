# Configuración de Google Service Account para Subir Códigos

Para poder usar la función de subir códigos a las hojas de cálculo de Google, necesitas configurar una Service Account de Google Cloud.

## Pasos para configurar la Service Account

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el nombre de tu proyecto

### 2. Habilitar la API de Google Sheets

1. En el menú de navegación, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Sheets API"
3. Haz clic en "Habilitar"

### 3. Crear una Service Account

1. En el menú de navegación, ve a "IAM y administración" > "Cuentas de servicio"
2. Haz clic en "Crear cuenta de servicio"
3. Ingresa un nombre (ejemplo: "excel-reader-app")
4. Haz clic en "Crear y continuar"
5. Omite los pasos opcionales y haz clic en "Listo"

### 4. Crear una clave para la Service Account

1. Haz clic en la cuenta de servicio que acabas de crear
2. Ve a la pestaña "Claves"
3. Haz clic en "Agregar clave" > "Crear clave nueva"
4. Selecciona el formato "JSON"
5. Haz clic en "Crear"
6. El archivo JSON se descargará automáticamente

### 5. Configurar las variables de entorno

1. Abre el archivo JSON que descargaste
2. Copia el valor de `client_email`
3. Copia el valor de `private_key` (incluye todo, desde `-----BEGIN PRIVATE KEY-----` hasta `-----END PRIVATE KEY-----\n`)
4. Crea un archivo `.env.local` en la raíz del proyecto
5. Agrega las siguientes variables:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-email@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu_Clave_Privada_Aquí\n-----END PRIVATE KEY-----\n"
```

### 6. Compartir tus hojas de cálculo con la Service Account

**IMPORTANTE**: Para que la service account pueda escribir en tus hojas de cálculo, debes compartirlas con el email de la service account.

1. Abre la hoja de cálculo en Google Sheets
2. Haz clic en "Compartir"
3. Ingresa el email de la service account (ejemplo: `tu-email@tu-proyecto.iam.gserviceaccount.com`)
4. Dale permisos de "Editor"
5. Haz clic en "Enviar"

### 7. Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno, reinicia el servidor:

```bash
npm run dev
```

## ¡Listo!

Ahora deberías poder usar la función de "Subir Códigos" para agregar códigos a tus hojas de cálculo de Google.

## Solución de problemas

### Error: "Service account not configured"
- Verifica que las variables de entorno estén correctamente configuradas en `.env.local`
- Asegúrate de que el servidor esté reiniciado después de agregar las variables

### Error: "Permission denied" o "The caller does not have permission"
- Verifica que hayas compartido la hoja de cálculo con el email de la service account
- Asegúrate de darle permisos de "Editor"

### Error: "Invalid credentials"
- Verifica que hayas copiado correctamente el `private_key` del archivo JSON
- Asegúrate de incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Verifica que los saltos de línea estén representados como `\n`
