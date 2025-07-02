const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_finanDom';

router.post('/register', (req, res) => {
  const { name, email, password, role = 'prestamista' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Verificar si el usuario ya existe
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(checkQuery, [email], async (err, existingUser) => {
    if (err) return res.status(500).json({ message: 'Error interno del servidor.' });
    if (existingUser) return res.status(409).json({ message: 'El correo ya está registrado.' });

    const password_hash = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    db.run(insertQuery, [name, email, password_hash, role], function (insertErr) {
      if (insertErr) return res.status(500).json({ message: 'Error al registrar usuario.' });

      return res.status(201).json({
        message: 'Usuario registrado exitosamente.',
        user: {
          id: this.lastID,
          name,
          email,
          role,
        },
      });
    });
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar campos
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    // Buscar usuario por email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error en consulta:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
