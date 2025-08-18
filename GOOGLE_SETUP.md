# Configuración de Google Sign-In para FinanDom

## 1. Configurar Google Cloud Console

### Paso 1: Crear Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ API

### Paso 2: Configurar OAuth 2.0
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Android" como tipo de aplicación
4. Completa la información:
   - **Package name**: `com.finandom` (debe coincidir con tu `android/app/build.gradle`)
   - **SHA-1 certificate fingerprint**: Obtén esto ejecutando:
     ```bash
     cd android && ./gradlew signingReport
     ```

### Paso 3: Obtener Credenciales
1. Copia el **Client ID** y **Client Secret**
2. Actualiza el archivo `finan-backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=tu-client-secret
   ```

## 2. Configurar React Native

### Paso 1: Actualizar google-services.json
1. Descarga el archivo `google-services.json` desde Google Cloud Console
2. Colócalo en `android/app/google-services.json`

### Paso 2: Actualizar build.gradle
1. En `android/build.gradle`, agrega:
   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.3.15'
       }
   }
   ```

2. En `android/app/build.gradle`, agrega:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### Paso 3: Actualizar configuración
1. En `src/config/google.ts`, actualiza:
   ```typescript
   webClientId: 'tu-web-client-id.apps.googleusercontent.com'
   ```

## 3. Configurar iOS (opcional)

### Paso 1: Configurar URL Schemes
1. En Xcode, ve a tu proyecto > Info.plist
2. Agrega URL Schemes con tu REVERSED_CLIENT_ID

### Paso 2: Actualizar Info.plist
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.finandom</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>tu-reversed-client-id</string>
        </array>
    </dict>
</array>
```

## 4. Probar la Implementación

### Paso 1: Iniciar Backend
```bash
cd finan-backend
npm start
```

### Paso 2: Iniciar App
```bash
npm run android
# o
npm run ios
```

### Paso 3: Probar Login
1. Abre la app
2. Ve a la pantalla de login
3. Toca "Continuar con Google"
4. Selecciona tu cuenta de Google
5. Verifica que se complete el login

## 5. Solución de Problemas

### Error: "Google Play Services not available"
- Asegúrate de tener Google Play Services instalado en el emulador/dispositivo
- Verifica que la API esté habilitada en Google Cloud Console

### Error: "Invalid client ID"
- Verifica que el `webClientId` en `src/config/google.ts` sea correcto
- Asegúrate de que el `google-services.json` esté en la ubicación correcta

### Error: "Network error"
- Verifica que el backend esté ejecutándose
- Confirma que las credenciales en `.env` sean correctas

## 6. Seguridad

### Recomendaciones
1. **Nunca** commits credenciales reales en Git
2. Usa variables de entorno para todas las credenciales
3. Restringe el acceso a tu proyecto de Google Cloud
4. Monitorea el uso de la API en Google Cloud Console

### Variables de Entorno Requeridas
```env
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
JWT_SECRET=tu-jwt-secret
```

## 7. Recursos Adicionales

- [Google Sign-In para React Native](https://github.com/react-native-google-signin/google-signin)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Console](https://console.firebase.google.com/) (alternativa para configuración)

