const { OAuth2Client } = require('google-auth-library');

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';

// Crear cliente OAuth2
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Función para verificar el token de Google
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      success: true,
      user: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      },
    };
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  verifyGoogleToken,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
};

