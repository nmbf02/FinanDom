const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

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
    db.run(insertQuery, [name, email, password_hash, role], function (err) {
      if (err) return res.status(500).json({ message: 'Error al registrar usuario.' });

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

module.exports = router;
