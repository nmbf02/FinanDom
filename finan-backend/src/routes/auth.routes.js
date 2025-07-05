const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../config/email');
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

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email es requerido' });
  }

  try {
    // Verificar si el usuario existe
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error verificando usuario:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Generar código de 6 dígitos
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calcular tiempo de expiración (15 minutos)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // Guardar código en la base de datos
      const insertQuery = `
        INSERT INTO password_resets (email, code, expires_at)
        VALUES (?, ?, ?)
      `;
      
      db.run(insertQuery, [email, resetCode, expiresAt], async function (insertErr) {
        if (insertErr) {
          console.error('Error guardando código:', insertErr);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        // Enviar email con el código
        const emailSent = await sendPasswordResetEmail(email, resetCode);
        
        if (emailSent) {
          res.json({ message: 'Código de recuperación enviado a tu email' });
        } else {
          res.status(500).json({ message: 'Error enviando email de recuperación' });
        }
      });
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para verificar código y cambiar contraseña
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Buscar código válido
    const checkQuery = `
      SELECT * FROM password_resets 
      WHERE email = ? AND code = ? AND used = FALSE AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `;
    
    db.get(checkQuery, [email, code], async (err, resetRecord) => {
      if (err) {
        console.error('Error verificando código:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (!resetRecord) {
        return res.status(400).json({ message: 'Código inválido o expirado' });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña del usuario
      const updateUserQuery = 'UPDATE users SET password_hash = ? WHERE email = ?';
      db.run(updateUserQuery, [hashedPassword, email], function (updateErr) {
        if (updateErr) {
          console.error('Error actualizando contraseña:', updateErr);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        // Marcar código como usado
        const markUsedQuery = 'UPDATE password_resets SET used = TRUE WHERE id = ?';
        db.run(markUsedQuery, [resetRecord.id], function (markErr) {
          if (markErr) {
            console.error('Error marcando código como usado:', markErr);
          }

          res.json({ message: 'Contraseña actualizada exitosamente' });
        });
      });
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todos los tipos de documentos
router.get('/document-types', (req, res) => {
  req.app.get('db').all('SELECT id, name, description, is_active FROM document_types WHERE is_active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Error fetching document types:', err);
      return res.status(500).json({ message: 'Error al obtener tipos de documentos.' });
    }
    res.json(rows || []);
  });
});

// Obtener todos los clientes
router.get('/clients', (req, res) => {
  const query = `
    SELECT 
      c.id, 
      c.name, 
      c.identification, 
      c.document_type_id,
      dt.name as document_type_name,
      c.phone, 
      c.email, 
      c.address, 
      c.photo_url, 
      c.is_active,
      c.is_favorite
    FROM clients c
    LEFT JOIN document_types dt ON c.document_type_id = dt.id
  `;
  
  req.app.get('db').all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching clients:', err);
      return res.status(500).json({ message: 'Error al obtener clientes.' });
    }
    
    // Convertir valores numéricos a booleanos para is_favorite
    const clientsWithBooleans = (rows || []).map(client => ({
      ...client,
      is_favorite: Boolean(client.is_favorite)
    }));
    
    res.json(clientsWithBooleans);
  });
});

// Obtener un cliente específico
router.get('/clients/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.get('db').get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching client:', err);
      return res.status(500).json({ message: 'Error al obtener el cliente.' });
    }
    
    if (!row) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    
    res.json(row);
  });
});

// Crear un nuevo cliente
router.post('/clients', (req, res) => {
  const { name, identification, document_type_id, email, phone, address, photo_url, documents, is_active, is_favorite } = req.body;

  if (!name || !identification || !email || !phone || !address) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  const insertQuery = `
    INSERT INTO clients (user_id, name, identification, document_type_id, email, phone, address, photo_url, documents, is_active, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // user_id: por ahora 1 (ajustar según autenticación real)
  const user_id = 1;
  const documentsJson = documents ? JSON.stringify(documents) : null;

  req.app.get('db').run(
    insertQuery,
    [user_id, name, identification, document_type_id || 1, email, phone, address, photo_url, documentsJson, is_active ?? 1, is_favorite ?? 0],
    function (err) {
      if (err) {
        console.error('Error creating client:', err);
        return res.status(500).json({ message: 'Error al crear el cliente.' });
      }
      return res.status(201).json({
        message: 'Cliente creado exitosamente.',
        client: {
          id: this.lastID,
          user_id,
          name,
          identification,
          document_type_id: document_type_id || 1,
          email,
          phone,
          address,
          photo_url,
          documents,
          is_active: is_active ?? 1,
          is_favorite: Boolean(is_favorite ?? 0)
        }
      });
    }
  );
});

// Actualizar un cliente
router.put('/clients/:id', (req, res) => {
  const { id } = req.params;
  const { name, identification, document_type_id, email, phone, address, photo_url, documents, is_active, is_favorite } = req.body;

  if (!name || !identification || !email || !phone || !address) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  const updateQuery = `
    UPDATE clients 
    SET name = ?, identification = ?, document_type_id = ?, email = ?, phone = ?, address = ?, photo_url = ?, documents = ?, is_active = ?, is_favorite = ?
    WHERE id = ?
  `;

  const documentsJson = documents ? JSON.stringify(documents) : null;

  req.app.get('db').run(
    updateQuery,
    [name, identification, document_type_id || 1, email, phone, address, photo_url, documentsJson, is_active ?? 1, is_favorite ?? 0, id],
    function (err) {
      if (err) {
        console.error('Error updating client:', err);
        return res.status(500).json({ message: 'Error al actualizar el cliente.' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado.' });
      }
      
      return res.json({
        message: 'Cliente actualizado exitosamente.',
        client: {
          id: parseInt(id),
          name,
          identification,
          document_type_id: document_type_id || 1,
          email,
          phone,
          address,
          photo_url,
          documents,
          is_active: is_active ?? 1,
          is_favorite: Boolean(is_favorite ?? 0)
        }
      });
    }
  );
});

// Cancelar un cliente (marcar como inactivo)
router.delete('/clients/:id', (req, res) => {
  const { id } = req.params;

  // Primero verificar si el cliente tiene préstamos activos
  const checkLoansQuery = `
    SELECT COUNT(*) as active_loans 
    FROM loans 
    WHERE client_id = ? AND status = 'activo'
  `;

  req.app.get('db').get(checkLoansQuery, [id], (err, result) => {
    if (err) {
      console.error('Error checking loans:', err);
      return res.status(500).json({ message: 'Error al verificar préstamos del cliente.' });
    }

    if (result.active_loans > 0) {
      return res.status(400).json({ 
        message: 'No se puede cancelar el cliente porque tiene préstamos activos.',
        active_loans: result.active_loans
      });
    }

    // Si no tiene préstamos activos, marcar como inactivo
    const updateQuery = `UPDATE clients SET is_active = 0 WHERE id = ?`;

    req.app.get('db').run(updateQuery, [id], function (err) {
      if (err) {
        console.error('Error canceling client:', err);
        return res.status(500).json({ message: 'Error al cancelar el cliente.' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado.' });
      }
      
      return res.json({
        message: 'Cliente cancelado exitosamente.',
        client_id: parseInt(id)
      });
    });
  });
});

// Marcar/desmarcar cliente como favorito
router.patch('/clients/:id/favorite', (req, res) => {
  const { id } = req.params;
  const { is_favorite } = req.body;

  const updateQuery = `UPDATE clients SET is_favorite = ? WHERE id = ?`;

  req.app.get('db').run(updateQuery, [is_favorite ? 1 : 0, id], function (err) {
    if (err) {
      console.error('Error updating favorite status:', err);
      return res.status(500).json({ message: 'Error al actualizar estado de favorito.' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    
    return res.json({
      message: is_favorite ? 'Cliente marcado como favorito.' : 'Cliente removido de favoritos.',
      client_id: parseInt(id),
      is_favorite: is_favorite
    });
  });
});

// Crear un préstamo
router.post('/loans', (req, res) => {
  const {
    client_id,
    amount,
    interest_rate,
    num_installments,
    start_date,
    due_date,
    frequency,
    late_days,
    late_percent,
    contract_pdf_url
  } = req.body;

  if (!client_id || !amount || !interest_rate || !num_installments || !start_date || !due_date || !frequency) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  const insertQuery = `
    INSERT INTO loans (client_id, user_id, amount, interest_rate, total_with_interest, start_date, due_date, status, contract_pdf_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Calcular total con interés
  const total_with_interest = parseFloat(amount) + (parseFloat(amount) * parseFloat(interest_rate) / 100);

  // user_id: por ahora null o 1 (ajustar según autenticación real)
  const user_id = 1;

  // status por defecto 'activo'
  const status = 'activo';

  // Guardar préstamo
  req.app.get('db').run(
    insertQuery,
    [client_id, user_id, amount, interest_rate, total_with_interest, start_date, due_date, status, contract_pdf_url],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error al crear el préstamo.' });
      }
      return res.status(201).json({
        message: 'Préstamo creado exitosamente.',
        loan: {
          id: this.lastID,
          client_id,
          user_id,
          amount,
          interest_rate,
          total_with_interest,
          start_date,
          due_date,
          status,
          contract_pdf_url
        }
      });
    }
  );
});

module.exports = router;
