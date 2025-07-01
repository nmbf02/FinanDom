const express = require('express');
const router = express.Router();

// Registro
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  // Validación y lógica pendiente
  return res.status(201).json({ message: 'Usuario registrado correctamente' });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Autenticación pendiente
  return res.status(200).json({ message: 'Login exitoso', token: 'token_fake' });
});

// Forgot password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  // Lógica de recuperación pendiente
  return res.status(200).json({ message: 'Correo enviado para recuperación de contraseña' });
});

module.exports = router;
