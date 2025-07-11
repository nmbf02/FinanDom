const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../finanDom.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite.');

    // Crear tablas adaptadas a SQLite
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'prestamista',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Crear tabla de tipos de documentos
      db.run(`CREATE TABLE IF NOT EXISTS document_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insertar tipos de documentos por defecto
      const defaultTypes = [
        { id: 1, name: 'Cédula', description: 'Cédula de identidad' },
        { id: 2, name: 'Pasaporte', description: 'Pasaporte internacional' },
        { id: 3, name: 'Otro', description: 'Otro tipo de documento' },
        { id: 4, name: 'No aplica', description: 'Sin documento de identidad' }
      ];

      defaultTypes.forEach(type => {
        db.run(
          'INSERT OR IGNORE INTO document_types (id, name, description) VALUES (?, ?, ?)',
          [type.id, type.name, type.description]
        );
      });

      db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        identification TEXT UNIQUE,
        document_type_id INTEGER DEFAULT 1,
        phone TEXT,
        email TEXT,
        address TEXT,
        photo_url TEXT,
        documents TEXT,
        is_active INTEGER DEFAULT 1,
        is_favorite INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (document_type_id) REFERENCES document_types(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        total_with_interest DECIMAL(10,2) NOT NULL,
        num_installments INTEGER NOT NULL,
        start_date DATE NOT NULL,
        due_date DATE NOT NULL,
        frequency TEXT NOT NULL,
        late_fee_type_id INTEGER DEFAULT 1,
        late_days INTEGER DEFAULT 5,
        late_percent DECIMAL(5,2) DEFAULT 2.00,
        status TEXT DEFAULT 'activo',
        contract_pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (late_fee_type_id) REFERENCES late_fee_types(id)
      )`);

      // Lista de columnas a verificar y agregar si no existen
      const loanColumnsToAdd = [
        { name: 'num_installments', type: 'INTEGER NOT NULL DEFAULT 1' },
        { name: 'frequency', type: "TEXT NOT NULL DEFAULT 'mensual'" },
        { name: 'late_fee_type_id', type: 'INTEGER DEFAULT 1' },
        { name: 'late_days', type: 'INTEGER DEFAULT 5' },
        { name: 'late_percent', type: 'DECIMAL(5,2) DEFAULT 2.00' },
        { name: 'contract_pdf_url', type: 'TEXT' },
        { name: 'paid_installments', type: 'INTEGER DEFAULT 0' },
        { name: 'remaining_installments', type: 'INTEGER DEFAULT 0' }
      ];

      // Verificar y agregar columnas faltantes en la tabla loans
      loanColumnsToAdd.forEach(column => {
        db.get(`PRAGMA table_info(loans)`, [], (err, rows) => {
          if (err) {
            console.error('Error verificando estructura de tabla loans:', err);
            return;
          }
          
          // Verificar si la columna existe
          db.get(`PRAGMA table_info(loans)`, [], (err2, tableInfo) => {
            if (err2) {
              console.error('Error obteniendo info de tabla loans:', err2);
              return;
            }
            
            // Buscar si la columna ya existe
            db.all(`PRAGMA table_info(loans)`, [], (err3, columns) => {
              if (err3) {
                console.error('Error obteniendo columnas de loans:', err3);
                return;
              }
              
              const columnExists = columns.some(col => col.name === column.name);
              if (!columnExists) {
                console.log(`Agregando columna ${column.name} a tabla loans...`);
                db.run(`ALTER TABLE loans ADD COLUMN ${column.name} ${column.type}`, (err4) => {
                  if (err4) {
                    console.error(`Error agregando columna ${column.name}:`, err4);
                  } else {
                    console.log(`✅ Columna ${column.name} agregada exitosamente`);
                  }
                });
              }
            });
          });
        });
      });

      db.run(`CREATE TABLE IF NOT EXISTS installments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        installment_number INTEGER NOT NULL,
        due_date DATE NOT NULL,
        amount_due REAL NOT NULL,
        status TEXT DEFAULT 'pendiente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        installment_id INTEGER,
        loan_id INTEGER NOT NULL,
        amount_paid REAL NOT NULL,
        payment_date DATE NOT NULL,
        method TEXT DEFAULT 'efectivo',
        receipt_pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (installment_id) REFERENCES installments(id),
        FOREIGN KEY (loan_id) REFERENCES loans(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS late_fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        installment_id INTEGER NOT NULL,
        days_late INTEGER NOT NULL,
        fee_amount REAL NOT NULL,
        status TEXT DEFAULT 'pendiente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (installment_id) REFERENCES installments(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        signed_by_client INTEGER DEFAULT 0,
        signed_by_lender INTEGER DEFAULT 1,
        signature_client BLOB,
        signature_lender BLOB,
        pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS payment_behavior_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        loan_id INTEGER NOT NULL,
        behavior_type TEXT NOT NULL,
        detail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (loan_id) REFERENCES loans(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`);

      // Crear tabla de tipos de mora
      db.run(`CREATE TABLE IF NOT EXISTS late_fee_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        calculation_type TEXT NOT NULL,
        interval_days INTEGER DEFAULT 5,
        percentage_rate DECIMAL(5,2) DEFAULT 2.00,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insertar tipos de mora por defecto
      const defaultLateFeeTypes = [
        { 
          id: 1, 
          name: 'Mora Fija', 
          description: 'Se aplica 2% sobre el monto de la cuota vencida',
          calculation_type: 'fixed_interval',
          interval_days: 5,
          percentage_rate: 2.00
        },
        { 
          id: 2, 
          name: 'Mora por Arrastre', 
          description: '5 días de gracia, luego 2% sobre el total acumulado de deuda + mora anterior',
          calculation_type: 'carry_over',
          interval_days: 5,
          percentage_rate: 2.00
        }
      ];

      defaultLateFeeTypes.forEach(type => {
        db.run(
          'INSERT OR IGNORE INTO late_fee_types (id, name, description, calculation_type, interval_days, percentage_rate) VALUES (?, ?, ?, ?, ?, ?)',
          [type.id, type.name, type.description, type.calculation_type, type.interval_days, type.percentage_rate]
        );
      });

      db.run(`CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);

      // Seed inicial de métodos de pago
      const defaultPaymentMethods = [
        'Efectivo',
        'Cheque',
        'Transferencia',
        'Tarjeta',
        'Otros',
      ];
      defaultPaymentMethods.forEach((method) => {
        db.run(
          'INSERT OR IGNORE INTO payment_methods (name) VALUES (?)',
          [method]
        );
      });
    });
  }
});

module.exports = db;
