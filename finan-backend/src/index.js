require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();
const { sendEmail } = require('./config/email');

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

// Ruta del Asistente Inteligente
app.get('/api/assistant-suggestions', (req, res) => {
  const { type = 'all' } = req.query; // 'reminder', 'thanks', 'all'
  
  try {
    // Obtener préstamos con cuotas vencidas para recordatorios
    const getReminderSuggestions = () => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            l.id as loan_id,
            c.name as client_name,
            l.amount,
            i.id as installment_id,
            i.amount_due,
            i.due_date,
            i.status,
            julianday('now') - julianday(i.due_date) as days_overdue
          FROM loans l
          JOIN clients c ON l.client_id = c.id
          JOIN installments i ON l.id = i.loan_id
          WHERE i.status = 'pendiente' 
          AND i.due_date < date('now')
          AND l.status = 'activo'
          ORDER BY i.due_date ASC
          LIMIT 10
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          const suggestions = rows.map(row => ({
            id: `reminder_${row.installment_id}`,
            type: 'reminder',
            clientName: row.client_name,
            loanId: row.loan_id,
            installmentId: row.installment_id,
            amountDue: row.amount_due,
            dueDate: row.due_date,
            daysOverdue: Math.floor(row.days_overdue),
            text: `${row.client_name} tiene ${Math.floor(row.days_overdue)} día${Math.floor(row.days_overdue) > 1 ? 's' : ''} de atraso en su pago de RD$ ${parseFloat(row.amount_due).toLocaleString('es-DO', { minimumFractionDigits: 2 })}. ¿Deseas enviarle un recordatorio?`,
            status: 'pending'
          }));
          
          resolve(suggestions);
        });
      });
    };

    // Obtener préstamos con pagos recientes para agradecimientos
    const getThanksSuggestions = () => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            l.id as loan_id,
            c.name as client_name,
            p.id as payment_id,
            p.amount_paid,
            p.payment_date,
            p.method
          FROM loans l
          JOIN clients c ON l.client_id = c.id
          JOIN payments p ON l.id = p.loan_id
          WHERE p.payment_date >= date('now', '-7 days')
          AND l.status = 'activo'
          ORDER BY p.payment_date DESC
          LIMIT 10
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          const suggestions = rows.map(row => ({
            id: `thanks_${row.payment_id}`,
            type: 'thanks',
            clientName: row.client_name,
            loanId: row.loan_id,
            paymentId: row.payment_id,
            amountPaid: row.amount_paid,
            paymentDate: row.payment_date,
            method: row.method,
            text: `Gracias ${row.client_name} por tu pago puntual de RD$ ${parseFloat(row.amount_paid).toLocaleString('es-DO', { minimumFractionDigits: 2 })}. ¡Mantén así tu excelente historial de pagos!`,
            status: 'pending'
          }));
          
          resolve(suggestions);
        });
      });
    };

    // Ejecutar consultas según el tipo solicitado
    const getSuggestions = async () => {
      try {
        let suggestions = [];
        
        if (type === 'all' || type === 'reminder') {
          const reminderSuggestions = await getReminderSuggestions();
          suggestions = suggestions.concat(reminderSuggestions);
        }
        
        if (type === 'all' || type === 'thanks') {
          const thanksSuggestions = await getThanksSuggestions();
          suggestions = suggestions.concat(thanksSuggestions);
        }
        
        return suggestions;
      } catch (error) {
        throw error;
      }
    };

    getSuggestions()
      .then(suggestions => {
        res.json(suggestions);
      })
      .catch(error => {
        console.error('Error obteniendo sugerencias:', error);
        res.status(500).json({ 
          message: 'Error obteniendo sugerencias del asistente',
          error: error.message 
        });
      });

  } catch (error) {
    console.error('Error en assistant-suggestions:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// Ruta para enviar mensaje (real email o WhatsApp link)
app.post('/api/assistant-send-message', async (req, res) => {
  const { suggestionId, message, clientName, method, loanId } = req.body;

  try {
    if (!method || !['email', 'whatsapp'].includes(method)) {
      return res.status(400).json({ message: 'Método de envío inválido' });
    }

    // Buscar el cliente y tipo de sugerencia por el préstamo (loanId)
    db.get(
      `SELECT c.id as client_id, c.email, c.phone, c.name, l.id as loan_id
       FROM clients c
       JOIN loans l ON l.client_id = c.id
       WHERE l.id = ?`,
      [loanId],
      async (err, client) => {
        if (err || !client) {
          return res.status(404).json({ message: 'Cliente no encontrado para el préstamo' });
        }

        // Determinar tipo de sugerencia (reminder/thanks) a partir del suggestionId
        let type = 'reminder';
        if (suggestionId && suggestionId.startsWith('thanks_')) type = 'thanks';

        if (method === 'email') {
          if (!client.email) {
            return res.status(400).json({ message: 'El cliente no tiene email registrado' });
          }
          const subject = 'Mensaje de FinanDom';
          const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1CC88A;">Mensaje de FinanDom</h2>
            <p>Hola ${client.name},</p>
            <p>${message}</p>
            <p>Saludos,<br>Equipo FinanDom</p>
          </div>`;
          const sent = await sendEmail(client.email, subject, html);
          if (sent) {
            // Registrar en historial
            db.run(
              `INSERT INTO communications_history (client_id, loan_id, type, method, message, sent_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
              [client.client_id, client.loan_id, type, method, message],
              function (err2) {
                if (err2) {
                  console.error('Error guardando historial:', err2);
                }
                return res.json({ success: true, message: 'Correo enviado exitosamente', data: { suggestionId, clientName, method, sentAt: new Date().toISOString() } });
              }
            );
          } else {
            return res.status(500).json({ message: 'Error enviando el correo' });
          }
        } else if (method === 'whatsapp') {
          if (!client.phone) {
            return res.status(400).json({ message: 'El cliente no tiene número de teléfono registrado' });
          }
          // Formato internacional para WhatsApp (quita espacios y guiones)
          let phone = client.phone.replace(/[^0-9]/g, '');
          if (phone.startsWith('0')) phone = '1' + phone.substring(1); // Asume República Dominicana
          const encodedMsg = encodeURIComponent(message);
          const waLink = `https://wa.me/${phone}?text=${encodedMsg}`;
          // Registrar en historial
          db.run(
            `INSERT INTO communications_history (client_id, loan_id, type, method, message, sent_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [client.client_id, client.loan_id, type, method, message],
            function (err2) {
              if (err2) {
                console.error('Error guardando historial:', err2);
              }
              return res.json({ success: true, message: 'Link de WhatsApp generado', data: { suggestionId, clientName, method, waLink } });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ 
      message: 'Error enviando mensaje',
      error: error.message 
    });
  }
});

// Endpoint para obtener historial de comunicaciones
app.get('/api/communications-history', (req, res) => {
  const { type, search } = req.query;
  let query = `
    SELECT h.id, h.type, h.method, h.message, h.sent_at, h.loan_id, c.name as client_name
    FROM communications_history h
    JOIN clients c ON h.client_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (type && type !== 'all') {
    query += ' AND h.type = ?';
    params.push(type);
  }
  if (search) {
    query += ' AND (c.name LIKE ? OR h.method LIKE ? OR h.message LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY h.sent_at DESC LIMIT 100';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error obteniendo historial:', err);
      return res.status(500).json({ message: 'Error obteniendo historial', error: err.message });
    }
    res.json(rows);
  });
});

// Ruta de prueba
app.get('/hello', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente 🚀' });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
