import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CONFIG } from './google-config';

// Configuración de Google Sign-In
export const configureGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      // IMPORTANTE: Este debe ser el Web Client ID, no el Android Client ID
      // Obtener desde Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
      // Debe ser de tipo "Web application", no "Android"
      webClientId: GOOGLE_CONFIG.webClientId,
      offlineAccess: GOOGLE_CONFIG.offlineAccess,
      hostedDomain: GOOGLE_CONFIG.hostedDomain,
      forceCodeForRefreshToken: GOOGLE_CONFIG.forceCodeForRefreshToken,
    });
    console.log('✅ Google Sign-In configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando Google Sign-In:', error);
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    // Verificar que Google Play Services esté disponible
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Intentar hacer sign in directamente
    const userInfo = await GoogleSignin.signIn();
    
    // Obtener el ID token por separado
    const tokens = await GoogleSignin.getTokens();
    
    return {
      success: true,
      user: userInfo,
      idToken: tokens.accessToken, // Usar accessToken en lugar de idToken
    };
  } catch (error: any) {
    console.error('Error en Google Sign-In:', error);
    
    // Manejo específico de errores comunes
    let errorMessage = 'Error desconocido en Google Sign-In';
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Inicio de sesión cancelado por el usuario';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Ya hay un inicio de sesión en progreso';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services no está disponible';
    } else if (error.code === 'DEVELOPER_ERROR') {
      errorMessage = 'Error de configuración del desarrollador. Verifica la configuración de Google Sign-In';
    } else if (error.code === 'SIGN_IN_REQUIRED') {
      errorMessage = 'Se requiere iniciar sesión';
    }
    
    return {
      success: false,
      error: errorMessage,
      code: error.code,
    };
  }
};

// Función para cerrar sesión de Google
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Error cerrando sesión de Google:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al cerrar sesión',
    };
  }
};

// Verificar si el usuario está logueado en Google
export const isSignedIn = async () => {
  try {
    // Intentar obtener el usuario actual para verificar si está logueado
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser !== null;
  } catch (error) {
    console.error('Error verificando estado de sesión:', error);
    return false;
  }
};

// Obtener usuario actual de Google
export const getCurrentUser = async () => {
  try {
    return await GoogleSignin.getCurrentUser();
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return null;
  }
};

