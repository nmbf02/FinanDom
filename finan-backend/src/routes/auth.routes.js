const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../config/email');
const { verifyGoogleToken } = require('../config/google');
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

// Login con Google
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Token de Google es requerido' });
  }

  try {
    // Verificar token de Google
    const googleResult = await verifyGoogleToken(idToken);
    
    if (!googleResult.success) {
      return res.status(401).json({ message: 'Token de Google inválido' });
    }

    const { email, name, googleId, picture } = googleResult.user;

    // Buscar usuario por email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error en consulta:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      let userId;
      let userRole = 'prestamista';

      if (!user) {
        // Crear nuevo usuario si no existe
        const insertQuery = `
          INSERT INTO users (name, email, google_id, photo_url, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [name, email, googleId, picture, userRole], function (insertErr) {
          if (insertErr) {
            console.error('Error creando usuario:', insertErr);
            return res.status(500).json({ message: 'Error al crear usuario' });
          }
          
          userId = this.lastID;
          completeLogin();
        });
      } else {
        // Usuario existe, verificar si tiene google_id
        if (!user.google_id) {
          // Actualizar usuario existente con google_id
          const updateQuery = 'UPDATE users SET google_id = ?, photo_url = ? WHERE id = ?';
          db.run(updateQuery, [googleId, picture, user.id], function (updateErr) {
            if (updateErr) {
              console.error('Error actualizando usuario:', updateErr);
            }
            userId = user.id;
            completeLogin();
          });
        } else {
          userId = user.id;
          completeLogin();
        }
      }

      function completeLogin() {
        // Generar token JWT
        const token = jwt.sign(
          { id: userId, email: email, role: userRole },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login con Google exitoso',
          user: {
            id: userId,
            name: name,
            email: email,
            role: userRole,
            photo_url: picture,
          },
          token,
        });
      }
    });
  } catch (err) {
    console.error('Error en login con Google:', err);
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

// Obtener todos los tipos de mora
router.get('/late-fee-types', (req, res) => {
  req.app.get('db').all('SELECT id, name, description, calculation_type, interval_days, percentage_rate, is_active FROM late_fee_types WHERE is_active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Error fetching late fee types:', err);
      return res.status(500).json({ message: 'Error al obtener tipos de mora.' });
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

// Obtener todos los préstamos
router.get('/loans', (req, res) => {
  const db = req.app.get('db');
  
  const query = `
    SELECT l.*, c.name as client_name, c.identification as client_identification
    FROM loans l
    LEFT JOIN clients c ON l.client_id = c.id
    ORDER BY l.created_at DESC, l.id DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching loans:', err);
      return res.status(500).json({ message: 'Error al obtener los préstamos.' });
    }
    res.json(rows || []);
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
    late_fee_type_id,
    late_days,
    late_percent,
    contract_pdf_url
  } = req.body;

  // Validar campos obligatorios y devolver cuáles faltan
  const missingFields = [];
  if (!client_id) missingFields.push('client_id');
  if (!amount) missingFields.push('amount');
  if (!interest_rate) missingFields.push('interest_rate');
  if (!num_installments) missingFields.push('num_installments');
  if (!start_date) missingFields.push('start_date');
  if (!due_date) missingFields.push('due_date');
  if (!frequency) missingFields.push('frequency');

  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: ' + missingFields.join(', ') });
  }

  const insertQuery = `
    INSERT INTO loans (client_id, user_id, amount, interest_rate, total_with_interest, num_installments, start_date, due_date, frequency, late_fee_type_id, late_days, late_percent, status, contract_pdf_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    [client_id, user_id, amount, interest_rate, total_with_interest, num_installments, start_date, due_date, frequency, late_fee_type_id || 1, late_days || 5, late_percent || 2.00, status, contract_pdf_url],
    function (err) {
      if (err) {
        console.error('Error SQL al crear el préstamo:', err);
        return res.status(500).json({ message: 'Error al crear el préstamo.', error: err.message });
      }
      
      const loanId = this.lastID;
      
      // Generar cuotas automáticamente
      const generateInstallments = () => {
        const cuotaBase = total_with_interest / num_installments;
        let currentDate = new Date(start_date);
        
        // Función para agregar días según la frecuencia
        const addDays = (date, days) => {
          const result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        };
        
        // Calcular días según frecuencia
        let daysToAdd = 30; // Por defecto mensual
        if (frequency === 'semanal') daysToAdd = 7;
        else if (frequency === 'quincenal') daysToAdd = 15;
        else if (frequency === 'bimestral') daysToAdd = 60;
        else if (frequency === 'trimestral') daysToAdd = 90;
        else if (frequency === 'semestral') daysToAdd = 180;
        else if (frequency === 'anual') daysToAdd = 365;
        
        // Generar cada cuota
        for (let i = 1; i <= num_installments; i++) {
          const dueDate = i === 1 ? start_date : addDays(currentDate, daysToAdd).toISOString().split('T')[0];
          const amountDue = i === num_installments ? 
            total_with_interest - (cuotaBase * (i - 1)) : // Última cuota: ajuste para evitar decimales
            cuotaBase;
          
          const insertInstallmentQuery = `
            INSERT INTO installments (loan_id, installment_number, due_date, amount_due, status)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          req.app.get('db').run(insertInstallmentQuery, [loanId, i, dueDate, amountDue, 'pendiente'], (installmentErr) => {
            if (installmentErr) {
              console.error(`Error creando cuota ${i}:`, installmentErr);
            }
          });
          
          if (i > 1) {
            currentDate = addDays(currentDate, daysToAdd);
          }
        }
      };
      
      // Generar las cuotas
      generateInstallments();
      
      return res.status(201).json({
        message: 'Préstamo creado exitosamente con cuotas generadas.',
        loan: {
          id: loanId,
          client_id,
          user_id,
          amount,
          interest_rate,
          total_with_interest,
          num_installments,
          start_date,
          due_date,
          frequency,
          late_fee_type_id: late_fee_type_id || 1,
          late_days: late_days || 5,
          late_percent: late_percent || 2.00,
          status,
          contract_pdf_url
        }
      });
    }
  );
});

// Endpoint para métricas globales del dashboard
router.get('/dashboard-metrics', (req, res) => {
  const db = req.app.get('db');
  const metrics = {};

  // Total Prestado
  db.get('SELECT SUM(amount) as total_prestado FROM loans', [], (err, row) => {
    if (err) {
      console.error('Error fetching total_prestado:', err);
      return res.status(500).json({ message: 'Error al obtener métricas.' });
    }
    metrics.total_prestado = row?.total_prestado || 0;
    // Total Recuperado
    db.get('SELECT SUM(amount_paid) as total_recuperado FROM payments', [], (err2, row2) => {
      if (err2) {
        console.error('Error fetching total_recuperado:', err2);
        return res.status(500).json({ message: 'Error al obtener métricas.' });
      }
      metrics.total_recuperado = row2?.total_recuperado || 0;
      // Total en Mora (cuotas vencidas y no pagadas)
      db.get(`SELECT SUM(amount_due) as total_mora FROM installments WHERE status = 'vencida' OR (status = 'pendiente' AND due_date < DATE('now'))`, [], (err3, row3) => {
        if (err3) {
          console.error('Error fetching total_mora:', err3);
          return res.status(500).json({ message: 'Error al obtener métricas.' });
        }
        metrics.total_mora = row3?.total_mora || 0;
        // Cantidad de préstamos activos
        db.get(`SELECT COUNT(*) as prestamos_activos FROM loans WHERE status = 'activo'`, [], (err4, row4) => {
          if (err4) {
            console.error('Error fetching prestamos_activos:', err4);
            return res.status(500).json({ message: 'Error al obtener métricas.' });
          }
          metrics.prestamos_activos = row4?.prestamos_activos || 0;
          // Cantidad de préstamos en mora (al menos una cuota vencida)
          db.get(`SELECT COUNT(DISTINCT loan_id) as prestamos_en_mora FROM installments WHERE status = 'vencida' OR (status = 'pendiente' AND due_date < DATE('now'))`, [], (err5, row5) => {
            if (err5) {
              console.error('Error fetching prestamos_en_mora:', err5);
              return res.status(500).json({ message: 'Error al obtener métricas.' });
            }
            metrics.prestamos_en_mora = row5?.prestamos_en_mora || 0;
            // Cantidad de clientes activos
            db.get(`SELECT COUNT(*) as clientes_activos FROM clients WHERE is_active = 1`, [], (err6, row6) => {
              if (err6) {
                console.error('Error fetching clientes_activos:', err6);
                return res.status(500).json({ message: 'Error al obtener métricas.' });
              }
              metrics.clientes_activos = row6?.clientes_activos || 0;
              res.json(metrics);
            });
          });
        });
      });
    });
  });
});

// Endpoint para agenda dinámica de pagos
router.get('/agenda', (req, res) => {
  const db = req.app.get('db');
  let { start_date, end_date, view } = req.query;

  // Calcular rango de fechas según el view
  const today = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (!start_date && !end_date) {
    if (view === 'dia') {
      start_date = end_date = format(today);
    } else if (view === 'mes') {
      start_date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
      end_date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-31`;
    } else if (view === 'ano' || view === 'año') {
      start_date = `${today.getFullYear()}-01-01`;
      end_date = `${today.getFullYear()}-12-31`;
    } else { // semana por defecto
      const day = today.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      start_date = format(monday);
      end_date = format(sunday);
    }
  } else if (start_date && !end_date) {
    end_date = start_date;
  } else if (!start_date && end_date) {
    start_date = end_date;
  }

  // Consulta de cuotas a pagar en el rango
  const query = `
    SELECT i.id as installment_id, i.loan_id, i.due_date, i.amount_due, i.status,
           c.id as client_id, c.name as client_name
    FROM installments i
    JOIN loans l ON i.loan_id = l.id
    JOIN clients c ON l.client_id = c.id
    WHERE i.due_date BETWEEN ? AND ?
    ORDER BY i.due_date ASC
  `;

  db.all(query, [start_date, end_date], (err, rows) => {
    if (err) {
      console.error('Error fetching agenda:', err);
      return res.status(500).json({ message: 'Error al obtener la agenda.' });
    }
    res.json(rows || []);
  });
});

// Métodos de pago
router.get('/payment-methods', (req, res) => {
  const db = req.app.get('db');
  db.all('SELECT * FROM payment_methods', [], (err, rows) => {
    if (err) {
      console.error('Error fetching payment methods:', err);
      return res.status(500).json({ message: 'Error al obtener métodos de pago.' });
    }
    res.json(rows || []);
  });
});

// Función para calcular cuotas faltantes (versión simplificada)
const calculateLoanRemainingInstallments = (db, loanId, callback) => {
  // Contar cuotas pagadas
  const countPaidQuery = 'SELECT COUNT(*) as paid_count FROM installments WHERE loan_id = ? AND status = "pagada"';
  
  db.get(countPaidQuery, [loanId], (err, result) => {
    if (err) {
      console.error('Error contando cuotas pagadas:', err);
      return callback(err);
    }
    
    const paidInstallments = result?.paid_count || 0;
    
    // Obtener total de cuotas del préstamo
    const getLoanQuery = 'SELECT num_installments FROM loans WHERE id = ?';
    
    db.get(getLoanQuery, [loanId], (err2, loan) => {
      if (err2 || !loan) {
        console.error('Error obteniendo préstamo:', err2);
        return callback(err2);
      }
      
      const totalInstallments = loan.num_installments;
      const remainingInstallments = totalInstallments - paidInstallments;
      
      console.log(`📊 Cálculo para préstamo ${loanId}: ${paidInstallments} pagadas de ${totalInstallments} totales = ${remainingInstallments} faltantes`);
      callback(null, { paidInstallments, remainingInstallments, totalInstallments });
    });
  });
};

// Función para actualizar cuotas faltantes en la tabla de préstamos
const updateLoanRemainingInstallments = (db, loanId, callback) => {
  // Primero calcular las cuotas faltantes
  calculateLoanRemainingInstallments(db, loanId, (err, result) => {
    if (err) {
      return callback(err);
    }
    
    // Verificar si las columnas existen antes de intentar actualizar
    db.all("PRAGMA table_info(loans)", [], (err2, columns) => {
      if (err2) {
        console.error('Error verificando estructura de tabla loans:', err2);
        // Si no podemos verificar, solo devolver el cálculo
        return callback(null, result);
      }
      
      const hasPaidInstallments = columns.some(col => col.name === 'paid_installments');
      const hasRemainingInstallments = columns.some(col => col.name === 'remaining_installments');
      
      if (!hasPaidInstallments || !hasRemainingInstallments) {
        console.log('⚠️ Columnas paid_installments o remaining_installments no existen en la tabla loans');
        // Devolver solo el cálculo sin actualizar la tabla
        return callback(null, result);
      }
      
      // Si las columnas existen, actualizar la tabla
      const updateQuery = 'UPDATE loans SET paid_installments = ?, remaining_installments = ? WHERE id = ?';
      
      db.run(updateQuery, [result.paidInstallments, result.remainingInstallments, loanId], function(err3) {
        if (err3) {
          console.error('Error actualizando cuotas faltantes en tabla:', err3);
          // Devolver el cálculo aunque falle la actualización
          return callback(null, result);
        }
        
        console.log(`✅ Cuotas faltantes actualizadas en tabla para préstamo ${loanId}`);
        callback(null, result);
      });
    });
  });
};

// Ruta para verificar estructura de la tabla loans
router.get('/loans/check-structure', (req, res) => {
  const db = req.app.get('db');
  
  db.all("PRAGMA table_info(loans)", [], (err, columns) => {
    if (err) {
      console.error('Error verificando estructura de tabla loans:', err);
      return res.status(500).json({ message: 'Error verificando estructura de tabla.' });
    }
    
    const columnNames = columns.map(col => col.name);
    const hasPaidInstallments = columnNames.includes('paid_installments');
    const hasRemainingInstallments = columnNames.includes('remaining_installments');
    
    res.json({
      columns: columnNames,
      hasPaidInstallments,
      hasRemainingInstallments,
      needsUpdate: !hasPaidInstallments || !hasRemainingInstallments
    });
  });
});

// Ruta para agregar columnas faltantes a la tabla loans
router.post('/loans/add-missing-columns', (req, res) => {
  const db = req.app.get('db');
  
  db.all("PRAGMA table_info(loans)", [], (err, columns) => {
    if (err) {
      console.error('Error verificando estructura de tabla loans:', err);
      return res.status(500).json({ message: 'Error verificando estructura de tabla.' });
    }
    
    const columnNames = columns.map(col => col.name);
    const hasPaidInstallments = columnNames.includes('paid_installments');
    const hasRemainingInstallments = columnNames.includes('remaining_installments');
    
    let columnsAdded = 0;
    let totalToAdd = 0;
    
    if (!hasPaidInstallments) totalToAdd++;
    if (!hasRemainingInstallments) totalToAdd++;
    
    if (totalToAdd === 0) {
      return res.json({ message: 'Todas las columnas ya existen.' });
    }
    
    const addColumn = (columnName, columnType) => {
      db.run(`ALTER TABLE loans ADD COLUMN ${columnName} ${columnType}`, (err) => {
        if (err) {
          console.error(`Error agregando columna ${columnName}:`, err);
          return res.status(500).json({ message: `Error agregando columna ${columnName}` });
        }
        
        console.log(`✅ Columna ${columnName} agregada exitosamente`);
        columnsAdded++;
        
        if (columnsAdded === totalToAdd) {
          res.json({ 
            message: 'Columnas agregadas exitosamente.',
            columnsAdded: totalToAdd
          });
        }
      });
    };
    
    if (!hasPaidInstallments) {
      addColumn('paid_installments', 'INTEGER DEFAULT 0');
    }
    
    if (!hasRemainingInstallments) {
      addColumn('remaining_installments', 'INTEGER DEFAULT 0');
    }
  });
});

// Ruta para actualizar cuotas faltantes de un préstamo específico
router.post('/loans/:id/update-installments', (req, res) => {
  const db = req.app.get('db');
  const loanId = req.params.id;

  updateLoanRemainingInstallments(db, loanId, (err, result) => {
    if (err) {
      console.error('Error actualizando cuotas faltantes:', err);
      return res.status(500).json({ message: 'Error al actualizar cuotas faltantes.' });
    }
    
    res.json({
      message: 'Cuotas faltantes actualizadas exitosamente.',
      result
    });
  });
});

// Resumen de préstamo con actualización automática de cuotas faltantes
router.get('/loans/:id/summary', (req, res) => {
  const db = req.app.get('db');
  const loanId = req.params.id;

  // Obtener datos del préstamo y cliente
  const loanQuery = `
    SELECT l.*, c.name as client_name
    FROM loans l
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE l.id = ?
  `;

  db.get(loanQuery, [loanId], (err, loan) => {
    if (err || !loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }
    
    // Actualizar cuotas faltantes automáticamente
    updateLoanRemainingInstallments(db, loanId, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error actualizando cuotas faltantes:', updateErr);
        // Continuar sin actualizar si hay error
      }
      
    // Cuotas pagadas
    db.get('SELECT COUNT(*) as paid_installments FROM installments WHERE loan_id = ? AND status = "pagada"', [loanId], (err2, row2) => {
      const paidInstallments = row2?.paid_installments || 0;
      // Monto pagado
      db.get('SELECT SUM(amount_paid) as paid_amount FROM payments WHERE loan_id = ?', [loanId], (err3, row3) => {
        const paidAmount = row3?.paid_amount || 0;
        const totalInstallments = loan.num_installments;
        const remainingInstallments = totalInstallments - paidInstallments;
        res.json({
          ...loan,
          paid_installments: paidInstallments,
          paid_amount: paidAmount,
          remaining_installments: remainingInstallments,
          });
        });
      });
    });
  });
});

// Crear un pago
router.post('/payments', (req, res) => {
  const {
    loan_id,
    amount_paid,
    payment_date,
    method,
    installment_ids,
    reference
  } = req.body;

  // Validar campos obligatorios
  if (!loan_id || !amount_paid || !payment_date) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: loan_id, amount_paid, payment_date' });
  }

  const db = req.app.get('db');
  
  // Insertar el pago principal
  const insertPaymentQuery = `
    INSERT INTO payments (loan_id, amount_paid, payment_date, method, receipt_pdf_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(insertPaymentQuery, [loan_id, amount_paid, payment_date, method || 'efectivo', null], function(err) {
    if (err) {
      console.error('Error al insertar pago:', err);
      return res.status(500).json({ message: 'Error al registrar el pago.' });
    }
    
    const paymentId = this.lastID;
    
    // Si se especificaron cuotas específicas, actualizar su estado
    if (installment_ids && installment_ids.length > 0) {
      const updateInstallmentQuery = `
        UPDATE installments 
        SET status = 'pagada' 
        WHERE id IN (${installment_ids.map(() => '?').join(',')}) AND loan_id = ?
      `;
      
      db.run(updateInstallmentQuery, [...installment_ids, loan_id], function(err2) {
        if (err2) {
          console.error('Error al actualizar cuotas:', err2);
          return res.status(500).json({ message: 'Error al actualizar cuotas.' });
        }
        
        res.status(201).json({
          message: 'Pago registrado exitosamente.',
          payment: {
            id: paymentId,
            loan_id,
            amount_paid,
            payment_date,
            method: method || 'efectivo',
            installment_ids
          }
        });
      });
    } else {
      // Si no se especificaron cuotas, solo responder con éxito
      res.status(201).json({
        message: 'Pago registrado exitosamente.',
        payment: {
          id: paymentId,
          loan_id,
          amount_paid,
          payment_date,
          method: method || 'efectivo'
        }
      });
    }
  });
});

// Obtener todos los pagos
router.get('/payments', (req, res) => {
  const db = req.app.get('db');
  const { loan_id } = req.query;
  
  let query = `
    SELECT p.*, l.amount as loan_amount, c.name as client_name
    FROM payments p
    LEFT JOIN loans l ON p.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
  `;
  
  let params = [];
  
  if (loan_id) {
    query += ' WHERE p.loan_id = ?';
    params.push(loan_id);
  }
  
  query += ' ORDER BY p.payment_date DESC, p.id DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener pagos:', err);
      return res.status(500).json({ message: 'Error al obtener pagos.' });
    }
    res.json(rows || []);
  });
});

// Obtener pagos por préstamo
router.get('/payments/loan/:loanId', (req, res) => {
  const db = req.app.get('db');
  const { loanId } = req.params;
  
  const query = `
    SELECT p.*, l.amount as loan_amount, c.name as client_name
    FROM payments p
    LEFT JOIN loans l ON p.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE p.loan_id = ?
    ORDER BY p.payment_date DESC, p.id DESC
  `;
  
  db.all(query, [loanId], (err, rows) => {
    if (err) {
      console.error('Error al obtener pagos del préstamo:', err);
      return res.status(500).json({ message: 'Error al obtener pagos del préstamo.' });
    }
    res.json(rows || []);
  });
});

// Obtener todas las cuotas
router.get('/installments', (req, res) => {
  const db = req.app.get('db');
  const { loan_id, status } = req.query;
  
  let query = `
    SELECT i.*, l.amount as loan_amount, c.name as client_name
    FROM installments i
    LEFT JOIN loans l ON i.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
  `;
  
  let params = [];
  let whereConditions = [];
  
  if (loan_id) {
    whereConditions.push('i.loan_id = ?');
    params.push(loan_id);
  }
  
  if (status) {
    whereConditions.push('i.status = ?');
    params.push(status);
  }
  
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  query += ' ORDER BY i.due_date ASC, i.id ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener cuotas:', err);
      return res.status(500).json({ message: 'Error al obtener cuotas.' });
    }
    res.json(rows || []);
  });
});

// Obtener cuotas por préstamo
router.get('/installments/loan/:loanId', (req, res) => {
  const db = req.app.get('db');
  const { loanId } = req.params;
  
  const query = `
    SELECT i.*, l.amount as loan_amount, c.name as client_name
    FROM installments i
    LEFT JOIN loans l ON i.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE i.loan_id = ?
    ORDER BY i.due_date ASC, i.id ASC
  `;
  
  db.all(query, [loanId], (err, rows) => {
    if (err) {
      console.error('Error al obtener cuotas del préstamo:', err);
      return res.status(500).json({ message: 'Error al obtener cuotas del préstamo.' });
    }
    res.json(rows || []);
  });
});

// Obtener pagos en mora
router.get('/payments/overdue', (req, res) => {
  const db = req.app.get('db');
  
  const query = `
    SELECT p.*, l.amount as loan_amount, c.name as client_name, c.phone as client_phone
    FROM payments p
    LEFT JOIN loans l ON p.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE p.payment_date < DATE('now', '-1 day')
    ORDER BY p.payment_date ASC, p.id ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener pagos en mora:', err);
      return res.status(500).json({ message: 'Error al obtener pagos en mora.' });
    }
    res.json(rows || []);
  });
});

// Obtener próxima cuota a pagar por préstamo
router.get('/installments/loan/:loanId/next', (req, res) => {
  const db = req.app.get('db');
  const { loanId } = req.params;
  
  const query = `
    SELECT i.*, l.amount as loan_amount, c.name as client_name
    FROM installments i
    LEFT JOIN loans l ON i.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE i.loan_id = ? AND i.status = 'pendiente'
    ORDER BY i.due_date ASC, i.id ASC
    LIMIT 1
  `;
  
  db.get(query, [loanId], (err, row) => {
    if (err) {
      console.error('Error al obtener próxima cuota:', err);
      return res.status(500).json({ message: 'Error al obtener próxima cuota.' });
    }
    
    if (!row) {
      return res.status(404).json({ message: 'No hay cuotas pendientes para este préstamo.' });
    }
    
    res.json(row);
  });
});

// Verificar y generar cuotas si es necesario
router.post('/loans/:loanId/check-installments', (req, res) => {
  const db = req.app.get('db');
  const { loanId } = req.params;
  
  // Verificar si el préstamo existe
  db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, loan) => {
    if (err) {
      console.error('Error obteniendo préstamo:', err);
      return res.status(500).json({ message: 'Error obteniendo préstamo.' });
    }
    
    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }
    
    // Verificar si tiene cuotas
    db.get('SELECT COUNT(*) as count FROM installments WHERE loan_id = ?', [loanId], (err2, result) => {
      if (err2) {
        console.error('Error verificando cuotas:', err2);
        return res.status(500).json({ message: 'Error verificando cuotas.' });
      }
      
      if (result.count > 0) {
        return res.json({
          message: 'El préstamo ya tiene cuotas.',
          hasInstallments: true,
          installmentsCount: result.count
        });
      }
      
      // Si no tiene cuotas, generarlas automáticamente
      const cuotaBase = loan.total_with_interest / loan.num_installments;
      let currentDate = new Date(loan.start_date);
      
      // Función para agregar días según la frecuencia
      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      // Calcular días según frecuencia
      let daysToAdd = 30; // Por defecto mensual
      if (loan.frequency === 'semanal') daysToAdd = 7;
      else if (loan.frequency === 'quincenal') daysToAdd = 15;
      else if (loan.frequency === 'bimestral') daysToAdd = 60;
      else if (loan.frequency === 'trimestral') daysToAdd = 90;
      else if (loan.frequency === 'semestral') daysToAdd = 180;
      else if (loan.frequency === 'anual') daysToAdd = 365;
      
      let installmentsCreated = 0;
      const totalInstallments = loan.num_installments;
      
      // Generar cada cuota
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = i === 1 ? loan.start_date : addDays(currentDate, daysToAdd).toISOString().split('T')[0];
        const amountDue = i === totalInstallments ? 
          loan.total_with_interest - (cuotaBase * (i - 1)) : // Última cuota: ajuste para evitar decimales
          cuotaBase;
        
        const insertInstallmentQuery = `
          INSERT INTO installments (loan_id, installment_number, due_date, amount_due, status)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertInstallmentQuery, [loanId, i, dueDate, amountDue, 'pendiente'], (installmentErr) => {
          if (installmentErr) {
            console.error(`Error creando cuota ${i}:`, installmentErr);
          } else {
            installmentsCreated++;
            
            // Si es la última cuota, responder
            if (installmentsCreated === totalInstallments) {
              res.json({
                message: `Cuotas generadas automáticamente para el préstamo ${loanId}.`,
                hasInstallments: true,
                installmentsCreated,
                loanId
              });
            }
          }
        });
        
        if (i > 1) {
          currentDate = addDays(currentDate, daysToAdd);
        }
      }
    });
  });
});

// Generar recibo de pago
router.get('/payments/:paymentId/receipt', (req, res) => {
  const db = req.app.get('db');
  const { paymentId } = req.params;
  
  // Obtener información completa del pago
  const query = `
    SELECT p.*, l.amount as loan_amount, l.interest_rate, c.name as client_name, c.phone as client_phone, c.address as client_address
    FROM payments p
    LEFT JOIN loans l ON p.loan_id = l.id
    LEFT JOIN clients c ON l.client_id = c.id
    WHERE p.id = ?
  `;
  
  db.get(query, [paymentId], (err, payment) => {
    if (err) {
      console.error('Error obteniendo pago para recibo:', err);
      return res.status(500).json({ message: 'Error obteniendo información del pago.' });
    }
    
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado.' });
    }
    
    // Generar datos del recibo
    const receipt = {
      receipt_number: `REC-${paymentId.toString().padStart(6, '0')}`,
      payment_date: payment.payment_date,
      client_name: payment.client_name,
      client_phone: payment.client_phone,
      client_address: payment.client_address,
      loan_id: payment.loan_id,
      amount_paid: payment.amount_paid,
      method: payment.method,
      loan_amount: payment.loan_amount,
      interest_rate: payment.interest_rate,
      generated_at: new Date().toISOString()
    };
    
    res.json({
      message: 'Recibo generado exitosamente.',
      receipt,
      download_url: `${req.protocol}://${req.get('host')}/api/payments/${paymentId}/receipt/pdf`
    });
  });
});

// Cancelar un pago
router.post('/payments/:paymentId/cancel', (req, res) => {
  const db = req.app.get('db');
  const { paymentId } = req.params;
  const { reason } = req.body;
  
  // Primero obtener el pago para verificar que existe
  db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, payment) => {
    if (err) {
      console.error('Error obteniendo pago:', err);
      return res.status(500).json({ message: 'Error obteniendo pago.' });
    }
    
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado.' });
    }
    
    // Marcar el pago como cancelado (podríamos agregar una columna status a la tabla payments)
    // Por ahora, vamos a eliminar el pago y revertir las cuotas asociadas
    db.run('DELETE FROM payments WHERE id = ?', [paymentId], function(err2) {
      if (err2) {
        console.error('Error cancelando pago:', err2);
        return res.status(500).json({ message: 'Error cancelando pago.' });
      }
      
      // También deberíamos revertir el estado de las cuotas asociadas
      // Por ahora solo respondemos con éxito
      res.json({
        message: 'Pago cancelado exitosamente.',
        paymentId: parseInt(paymentId),
        reason: reason || 'Sin especificar'
      });
    });
  });
});

// Generar cuotas para un préstamo existente
router.post('/loans/:loanId/generate-installments', (req, res) => {
  const db = req.app.get('db');
  const { loanId } = req.params;
  
  // Primero verificar si el préstamo existe y obtener sus datos
  db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, loan) => {
    if (err) {
      console.error('Error obteniendo préstamo:', err);
      return res.status(500).json({ message: 'Error obteniendo préstamo.' });
    }
    
    if (!loan) {
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }
    
    // Verificar si ya tiene cuotas
    db.get('SELECT COUNT(*) as count FROM installments WHERE loan_id = ?', [loanId], (err2, result) => {
      if (err2) {
        console.error('Error verificando cuotas existentes:', err2);
        return res.status(500).json({ message: 'Error verificando cuotas existentes.' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ message: 'El préstamo ya tiene cuotas generadas.' });
      }
      
      // Generar cuotas
      const cuotaBase = loan.total_with_interest / loan.num_installments;
      let currentDate = new Date(loan.start_date);
      
      // Función para agregar días según la frecuencia
      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      // Calcular días según frecuencia
      let daysToAdd = 30; // Por defecto mensual
      if (loan.frequency === 'semanal') daysToAdd = 7;
      else if (loan.frequency === 'quincenal') daysToAdd = 15;
      else if (loan.frequency === 'bimestral') daysToAdd = 60;
      else if (loan.frequency === 'trimestral') daysToAdd = 90;
      else if (loan.frequency === 'semestral') daysToAdd = 180;
      else if (loan.frequency === 'anual') daysToAdd = 365;
      
      let installmentsCreated = 0;
      const totalInstallments = loan.num_installments;
      
      // Generar cada cuota
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = i === 1 ? loan.start_date : addDays(currentDate, daysToAdd).toISOString().split('T')[0];
        const amountDue = i === totalInstallments ? 
          loan.total_with_interest - (cuotaBase * (i - 1)) : // Última cuota: ajuste para evitar decimales
          cuotaBase;
        
        const insertInstallmentQuery = `
          INSERT INTO installments (loan_id, installment_number, due_date, amount_due, status)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertInstallmentQuery, [loanId, i, dueDate, amountDue, 'pendiente'], (installmentErr) => {
          if (installmentErr) {
            console.error(`Error creando cuota ${i}:`, installmentErr);
          } else {
            installmentsCreated++;
            
            // Si es la última cuota, responder
            if (installmentsCreated === totalInstallments) {
              res.json({
                message: `Cuotas generadas exitosamente para el préstamo ${loanId}.`,
                installmentsCreated,
                loanId
              });
            }
          }
        });
        
        if (i > 1) {
          currentDate = addDays(currentDate, daysToAdd);
        }
      }
    });
  });
});

// Actualizar datos de usuario
router.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password, photo_url, role, document_type_id, identification } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
  }

  let updateQuery = 'UPDATE users SET name = ?, email = ?, phone = ?, role = ?';
  const params = [name, email, phone, role || 'prestamista'];

  if (password) {
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);
    updateQuery += ', password_hash = ?';
    params.push(password_hash);
  }

  if (photo_url) {
    updateQuery += ', photo_url = ?';
    params.push(photo_url);
  }

  if (document_type_id) {
    updateQuery += ', document_type_id = ?';
    params.push(document_type_id);
  }

  if (identification) {
    updateQuery += ', identification = ?';
    params.push(identification);
  }

  updateQuery += ' WHERE id = ?';
  params.push(id);

  const db = req.app ? req.app.get('db') : require('../config/db');
  db.run(updateQuery, params, function (err) {
    if (err) {
      console.error('Error actualizando usuario:', err);
      return res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    return res.json({ message: 'Usuario actualizado correctamente.' });
  });
});

// Obtener datos de un usuario por ID
router.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const db = req.app ? req.app.get('db') : require('../config/db');
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('Error obteniendo usuario:', err);
      return res.status(500).json({ message: 'Error al obtener usuario.' });
    }
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(user);
  });
});

module.exports = router;
