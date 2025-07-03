const nodemailer = require('nodemailer');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar a 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASS // Password de aplicación de Gmail
  }
});

// Función para enviar email de recuperación
const sendPasswordResetEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperación de Contraseña - FinanDom',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1CC88A;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado recuperar tu contraseña en FinanDom.</p>
        <p>Tu código de recuperación es:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #1CC88A; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>Este código expira en 15 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>Saludos,<br>Equipo FinanDom</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

module.exports = { sendPasswordResetEmail }; 