// Configuración de Google Sign-In usando variables de entorno
// Copia este archivo a google-config.local.ts y llena los valores reales

export const GOOGLE_CONFIG = {
  // Web Client ID (tipo "Web application" en Google Cloud Console)
  webClientId: '655121357366-tn330nl136shuseju5gceof55n1dqmuf.apps.googleusercontent.com',
  
  // Android Client ID (tipo "Android" en Google Cloud Console)
  androidClientId: '655121357366-9kgcdn41v3g53d1v2at2v04i3aqpmkkc.apps.googleusercontent.com',
  
  // API Key de Google
  apiKey: 'AIzaSyDg-tOgl6LITCXjQ3M_40nXGCgwzA1RR4Q',
  
  // Configuración adicional
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
};

// Para usar variables de entorno, crea un archivo google-config.local.ts:
/*
export const GOOGLE_CONFIG = {
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'tu-web-client-id.apps.googleusercontent.com',
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || 'tu-android-client-id.apps.googleusercontent.com',
  apiKey: process.env.GOOGLE_API_KEY || 'tu-api-key',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
};
*/
