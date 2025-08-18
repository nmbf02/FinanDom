# Solución al Error DEVELOPER_ERROR en Google Sign-In

## Problema
Estás experimentando un error `DEVELOPER_ERROR` al intentar hacer login con Google en tu app React Native.

## Causa Principal
El error `DEVELOPER_ERROR` generalmente ocurre porque:
1. **Falta el `webClientId`** en la configuración de Google Sign-In
2. **El `webClientId` es incorrecto** (debe ser de tipo "Web application", no "Android")
3. **La configuración no coincide** con Google Cloud Console

## Solución Paso a Paso

### Paso 1: Ir a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto "finandom"
3. Ve a **APIs & Services** > **Credentials**

### Paso 2: Crear Cliente OAuth 2.0 Web
1. Haz clic en **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
2. Selecciona **"Web application"** como tipo
3. Dale un nombre descriptivo (ej: "FinanDom Web Client")
4. **NO** agregues URLs de redirección por ahora
5. Haz clic en **"Create"**
6. **Copia el Client ID** (será algo como `123456789-abcdef.apps.googleusercontent.com`)

### Paso 3: Actualizar la Configuración
1. Abre el archivo `src/config/google-config.ts`
2. Reemplaza el valor de `webClientId` con el Client ID que copiaste:

```typescript
export const GOOGLE_CONFIG = {
  // Reemplaza esto con tu Web Client ID real
  webClientId: 'TU-WEB-CLIENT-ID-REAL.apps.googleusercontent.com',
  // ... resto de la configuración
};
```

### Paso 4: Verificar Configuración
1. Asegúrate de que el archivo `android/app/google-services.json` esté en su lugar
2. Verifica que el `package_name` en `google-services.json` sea `com.finandom`
3. Confirma que el `applicationId` en `android/app/build.gradle` sea `com.finandom`

### Paso 5: Limpiar y Reconstruir
1. Detén la app si está ejecutándose
2. Ejecuta estos comandos:

```bash
# Limpiar cache de Metro
npx react-native start --reset-cache

# En otra terminal, limpiar y reconstruir Android
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Verificación de la Configuración

### Archivos que deben existir:
- ✅ `android/app/google-services.json`
- ✅ `android/app/build.gradle` (con `apply plugin: 'com.google.gms.google-services'`)
- ✅ `android/build.gradle` (con `classpath 'com.google.gms:google-services:4.4.3'`)
- ✅ `src/config/google-config.ts` (con `webClientId` correcto)

### Valores que deben coincidir:
- Package name en `google-services.json`: `com.finandom`
- Application ID en `build.gradle`: `com.finandom`
- Web Client ID en `google-config.ts`: Tu Web Client ID real

## Solución de Problemas Adicionales

### Si sigues teniendo problemas:

1. **Verifica Google Play Services**:
   - Asegúrate de que tu emulador/dispositivo tenga Google Play Services
   - En el emulador, instala Google Play Services desde Google Play Store

2. **Verifica la API**:
   - En Google Cloud Console, ve a **APIs & Services** > **Library**
   - Busca y habilita **"Google+ API"** o **"Google Identity"**

3. **Verifica las credenciales**:
   - Asegúrate de que el SHA-1 fingerprint en Google Cloud Console coincida con tu keystore
   - Para debug, ejecuta: `cd android && ./gradlew signingReport`

4. **Revisa los logs**:
   - Ejecuta `adb logcat` para ver logs detallados de Android
   - Busca errores relacionados con Google Sign-In

## Comando para Verificar SHA-1

```bash
cd android
./gradlew signingReport
```

Busca la línea que diga "SHA1" y cópiala a Google Cloud Console en la configuración del cliente Android.

## Contacto
Si sigues teniendo problemas después de seguir estos pasos, revisa:
- Los logs de la consola de React Native
- Los logs de Android con `adb logcat`
- La configuración en Google Cloud Console
