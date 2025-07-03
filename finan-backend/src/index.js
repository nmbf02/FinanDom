require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Hacer la base de datos disponible en req.app
app.set('db', db);

// Rutas
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // También permitir rutas sin /auth

const uploadRoutes = require('./routes/upload.routes');
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/hello', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente 🚀' });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
