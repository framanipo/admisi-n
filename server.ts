import express from "express";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import multer from "multer";

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Error creating uploads directory:", err);
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });

  app.use('/uploads', express.static(uploadsDir));

  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });

  // Database connection pool configuration
  const DB_CONFIG_FILE = path.join(process.cwd(), 'data', 'db-config.json');

  async function getDbConfig() {
    try {
      const data = await fs.readFile(DB_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return {
        host: process.env.DB_HOST || "155.248.226.7",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "uniq_admision",
        password: process.env.DB_PASSWORD || "M1c4s1t4TI.2026",
        database: process.env.DB_NAME || "uniq_admision",
      };
    }
  }

  let dbSettings = await getDbConfig();
  let pool = mysql.createPool({
    ...dbSettings,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 5000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  // Function to update pool
  const updatePool = async (newConfig: any) => {
    const oldPool = pool;
    pool = mysql.createPool({
      ...newConfig,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    try {
      await oldPool.end();
    } catch (e) {
      console.error("Error closing old pool:", e);
    }
  };

  // Email Transporter Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      console.log(`[EMAIL MOCK] Content: ${html.substring(0, 100)}...`);
      return;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "admision@uniq.edu.pe",
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent to ${to}`);
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error);
    }
  };

  // Test connection on startup with retries
  const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const connection = await pool.getConnection();
        console.log("[DB] SUCCESS: Connected to MySQL database");
        connection.release();
        return true;
      } catch (error: any) {
        console.error(`[DB] Attempt ${i + 1} failed: ${error.code} - ${error.message}`);
        if (i < retries - 1) {
          console.log("[DB] Retrying in 3 seconds...");
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.error("[DB] CRITICAL: All connection attempts timed out.");
          console.error(`[DB] TROUBLESHOOTING: This ETIMEDOUT error means your MySQL server at ${dbSettings.host} is not responding.`);
          console.error("[DB] 1. Check if the MySQL service is running.");
          console.error(`[DB] 2. Check if port ${dbSettings.port} is open in your server's firewall (iptables/ufw/cloud security groups).`);
          console.error("[DB] 3. Ensure MySQL is configured to listen on all interfaces (bind-address = 0.0.0.0).");
          console.error("[DB] 4. IMPORTANT: In cPanel, add IP 34.34.229.10 to 'Remote MySQL' allowed hosts.");
        }
      }
    }
    return false;
  };

  // Database Initialization
  const setupDatabase = async () => {
    let connection;
    try {
      const isConnected = await testConnection();
      if (!isConnected) return;

      connection = await pool.getConnection();
      
      // 1. CREATE TABLES
      
      // Table for Usuarios
      await connection.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'registrador', 'visualizador') DEFAULT 'visualizador',
          full_name VARCHAR(255),
          email VARCHAR(255)
        )
      `);

      // Table for Registrados (Master list of eligible students)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS registrados (
          id INT AUTO_INCREMENT PRIMARY KEY,
          dni VARCHAR(20) NOT NULL UNIQUE,
          nombres VARCHAR(255) NOT NULL,
          apellido_paterno VARCHAR(255) NOT NULL,
          apellido_materno VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          telefono VARCHAR(20)
        )
      `);

      // Table for Cronograma
      await connection.query(`
        CREATE TABLE IF NOT EXISTS cronograma (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event VARCHAR(255) NOT NULL,
          date VARCHAR(255) NOT NULL,
          status ENUM('activo', 'completado', 'pendiente') DEFAULT 'pendiente',
          order_index INT DEFAULT 0
        )
      `);

      // Table for Reglamento
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reglamento (
          id INT AUTO_INCREMENT PRIMARY KEY,
          chapter VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          order_index INT DEFAULT 0
        )
      `);

      // Table for Temario
      await connection.query(`
        CREATE TABLE IF NOT EXISTS temario (
          id INT AUTO_INCREMENT PRIMARY KEY,
          area VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          topics TEXT NOT NULL,
          order_index INT DEFAULT 0
        )
      `);

      // Table for Resultados
      await connection.query(`
        CREATE TABLE IF NOT EXISTS resultados (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pos INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          score VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          dni VARCHAR(20)
        )
      `);

      // Table for Carreras
      await connection.query(`
        CREATE TABLE IF NOT EXISTS carreras (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          vacancies INT DEFAULT 0
        )
      `);

      // Table for Modalidades
      await connection.query(`
        CREATE TABLE IF NOT EXISTS modalidades (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          fecha_inicio DATE,
          fecha_fin DATE,
          deshabilitado BOOLEAN DEFAULT FALSE
        )
      `);

      // Table for DNI API Config
      await connection.query(`
        CREATE TABLE IF NOT EXISTS config_api_dni (
          id INT PRIMARY KEY DEFAULT 1,
          api_url VARCHAR(255) NOT NULL,
          api_token TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Table for Preinscripciones
      await connection.query(`
        CREATE TABLE IF NOT EXISTS preinscripciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombres VARCHAR(255) NOT NULL,
          apellido_paterno VARCHAR(255) NOT NULL,
          apellido_materno VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          telefono VARCHAR(20),
          fecha_nacimiento DATE,
          genero VARCHAR(20),
          pueblo_indigena VARCHAR(50),
          departamento VARCHAR(100),
          provincia VARCHAR(100),
          distrito VARCHAR(100),
          colegio_nombre VARCHAR(255),
          colegio_tipo VARCHAR(50),
          anio_egreso INT,
          carrera VARCHAR(255),
          modalidad VARCHAR(100),
          estado ENUM('Pendiente', 'Validado', 'Observado') DEFAULT 'Pendiente',
          changed_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. INSERT INITIAL DATA
      
      // Insert default admin if not exists
      await connection.query(`
        INSERT IGNORE INTO usuarios (username, password, role, full_name, email)
        VALUES ('admin', 'admin123', 'admin', 'Administrador UNIQ', 'admision@uniq.edu.pe')
      `);

      // Insert sample registered students
      await connection.query(`
        INSERT IGNORE INTO registrados (dni, nombres, apellido_paterno, apellido_materno, email, telefono)
        VALUES 
        ('12345678', 'JUAN PABLO', 'PEREZ', 'GARCIA', 'juan.pablo@gmail.com', '987654321'),
        ('87654321', 'MARIA ELENA', 'RODRIGUEZ', 'LOPEZ', 'maria.elena@gmail.com', '912345678')
      `);

      // Insert default DNI config if not exists
      await connection.query(`
        INSERT IGNORE INTO config_api_dni (id, api_url, api_token)
        VALUES (1, 'https://dniruc.apisperu.com/api/v1/dni/', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImZyYW50aGt4eEBnbWFpbC5jb20ifQ.Sd5HK5UM_F5cGwv3iqpVaY5LmntjWOQMEvmDs-vPbjk')
      `);

      // 3. ALTER TABLES (MIGRATIONS)
      const columns = [
        "ALTER TABLE preinscripciones ADD COLUMN anio_egreso INT",
        "ALTER TABLE preinscripciones ADD COLUMN carrera VARCHAR(255)",
        "ALTER TABLE preinscripciones ADD COLUMN changed_by VARCHAR(255)",
        "ALTER TABLE preinscripciones ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE usuarios ADD COLUMN full_name VARCHAR(255)",
        "ALTER TABLE usuarios ADD COLUMN email VARCHAR(255)",
        "ALTER TABLE cronograma ADD COLUMN order_index INT DEFAULT 0",
        "ALTER TABLE reglamento ADD COLUMN order_index INT DEFAULT 0",
        "ALTER TABLE temario ADD COLUMN order_index INT DEFAULT 0"
      ];

      for (const sql of columns) {
        try {
          await connection.query(sql);
        } catch (e) {
          // Ignore if already exists
        }
      }

      console.log("[DB] Tables initialized successfully");
    } catch (error) {
      console.error("[DB ERROR] Failed to initialize tables:", error);
    } finally {
      if (connection) connection.release();
    }
  };

  // Start DB initialization in background
  setupDatabase();

  // Settings API
  const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

  async function getSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  async function saveSettings(settings: any) {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  }

  app.get("/api/settings", async (req, res) => {
    const settings = await getSettings();
    
    // Merge DNI config from DB
    try {
      const [rows]: any = await pool.query("SELECT api_url, api_token FROM config_api_dni WHERE id = 1");
      if (rows.length > 0) {
        settings.dniApiUrl = rows[0].api_url;
        settings.dniApiToken = rows[0].api_token;
      }
    } catch (e) {
      console.error("Error fetching DNI config from DB:", e);
    }
    
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    const newSettings = req.body;
    
    // Save DNI config to DB if present
    if (newSettings.dniApiUrl !== undefined || newSettings.dniApiToken !== undefined) {
      try {
        const [rows]: any = await pool.query("SELECT api_url, api_token FROM config_api_dni WHERE id = 1");
        const currentDniConfig = rows[0] || { api_url: '', api_token: '' };
        
        const apiUrl = newSettings.dniApiUrl !== undefined ? newSettings.dniApiUrl : currentDniConfig.api_url;
        const apiToken = newSettings.dniApiToken !== undefined ? newSettings.dniApiToken : currentDniConfig.api_token;
        
        await pool.query(
          "INSERT INTO config_api_dni (id, api_url, api_token) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE api_url = ?, api_token = ?",
          [apiUrl, apiToken, apiUrl, apiToken]
        );
        
        // Remove from JSON settings to avoid duplication
        delete newSettings.dniApiUrl;
        delete newSettings.dniApiToken;
      } catch (e) {
        console.error("Error saving DNI config to DB:", e);
      }
    }

    const currentSettings = await getSettings();
    await saveSettings({ ...currentSettings, ...newSettings });
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.get("/api/my-ip", async (req, res) => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.json({ ip: "No se pudo determinar (use 34.34.229.10)" });
    }
  });

  app.get("/api/db-config", async (req, res) => {
    const config = await getDbConfig();
    res.json(config);
  });

  app.post("/api/db-config", async (req, res) => {
    try {
      const newConfig = req.body;
      await fs.mkdir(path.dirname(DB_CONFIG_FILE), { recursive: true });
      await fs.writeFile(DB_CONFIG_FILE, JSON.stringify(newConfig, null, 2));
      await updatePool(newConfig);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/db-status", async (req, res) => {
    try {
      const config = await getDbConfig();
      const connection = await pool.getConnection();
      connection.release();
      res.json({ status: "connected", host: config.host, port: config.port });
    } catch (error: any) {
      const config = await getDbConfig();
      res.status(500).json({ 
        status: "error", 
        code: error.code, 
        message: error.message,
        host: config.host,
        port: config.port,
        details: "El servidor de base de datos no responde. Verifique el firewall y la configuración de red."
      });
    }
  });

  const handleDbError = (res: express.Response, error: any, context: string) => {
    console.error(`Error fetching ${context}:`, error);
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ER_HOST_NOT_PRIVILEGED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      res.status(503).json({ 
        error: "Database Connection Error", 
        details: "El servidor de base de datos no responde o el acceso fue denegado. Asegúrese de autorizar la IP 34.34.229.10 en cPanel (Remote MySQL)." 
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Cronograma API
  app.get("/api/cronograma", async (req, res) => {
    try {
      const [manualEventsRaw]: any = await pool.query("SELECT * FROM cronograma ORDER BY order_index ASC");
      const [modalidades]: any = await pool.query("SELECT * FROM modalidades WHERE deshabilitado = 0");
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const manualEvents = manualEventsRaw.map((ev: any) => {
        let status = ev.status;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(ev.date)) {
          const eventDate = new Date(ev.date + 'T00:00:00');
          eventDate.setHours(0, 0, 0, 0);
          if (now > eventDate) status = 'completado';
          else if (now.getTime() === eventDate.getTime()) status = 'activo';
          else status = 'pendiente';
        }
        return {
          id: ev.id.toString(),
          event: ev.event,
          date: ev.date,
          status: status
        };
      });

      const automaticEvents = modalidades.map((m: any) => {
        const inicio = new Date(m.fecha_inicio);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(m.fecha_fin);
        fin.setHours(0, 0, 0, 0);
        
        let status = 'pendiente';
        if (now > fin) status = 'completado';
        else if (now >= inicio) status = 'activo';
        
        const inicioStr = m.fecha_inicio ? new Date(m.fecha_inicio).toISOString().split('T')[0] : '';
        const finStr = m.fecha_fin ? new Date(m.fecha_fin).toISOString().split('T')[0] : '';
        
        return {
          id: `modalidad-${m.id}`,
          event: m.nombre,
          date: `${inicioStr} - ${finStr}`,
          status: status,
          isAutomatic: true
        };
      });
      
      res.json([...manualEvents, ...automaticEvents]);
    } catch (error) {
      handleDbError(res, error, "cronograma");
    }
  });

  app.post("/api/cronograma/bulk", async (req, res) => {
    try {
      const { events } = req.body;
      
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM cronograma");
        
        let manualIdCounter = 1;
        for (let i = 0; i < events.length; i++) {
          const ev = events[i];
          // Only save manual events
          if (!ev.isAutomatic) {
            await connection.query(
              "INSERT INTO cronograma (id, event, date, status, order_index) VALUES (?, ?, ?, ?, ?)",
              [manualIdCounter++, ev.event, ev.date, ev.status, i]
            );
          }
        }
        
        await connection.commit();
        res.json({ success: true });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (error) {
      handleDbError(res, error, "saving cronograma");
    }
  });

  // Reglamento API
  app.get("/api/reglamento", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM reglamento ORDER BY order_index ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "reglamento");
    }
  });

  // Temario API
  app.get("/api/temario", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM temario ORDER BY order_index ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "temario");
    }
  });

  // Resultados API
  app.get("/api/resultados", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM resultados ORDER BY pos ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "resultados");
    }
  });

  // Carreras API
  app.get("/api/carreras", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM carreras");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "carreras");
    }
  });

  // Get registration by DNI
  app.get("/api/registrations/dni/:dni", async (req, res) => {
    try {
      const { dni } = req.params;
      const [rows] = await pool.query("SELECT * FROM preinscripciones WHERE dni = ? ORDER BY created_at DESC LIMIT 1", [dni]);
      const results = rows as any[];
      if (results.length === 0) {
        return res.status(404).json({ error: "No se encontró preinscripción con ese DNI" });
      }
      res.json(results[0]);
    } catch (error) {
      handleDbError(res, error, "fetching registration by DNI");
    }
  });

  // Get all registrations
  app.get("/api/registrations", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM preinscripciones ORDER BY created_at DESC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "registrations");
    }
  });

  // Create a new registration
  app.post("/api/registrations", async (req, res) => {
    try {
      const {
        names,
        paternalSurname,
        maternalSurname,
        dni,
        email,
        phone,
        birthDate,
        gender,
        indigenousPeople,
        department,
        province,
        district,
        schoolName,
        schoolType,
        graduationYear,
        career,
        modality,
        changedBy,
      } = req.body;

      // Validate if student is in the master list (registrados)
      const [registeredRows]: any = await pool.query(
        "SELECT * FROM registrados WHERE dni = ?",
        [dni]
      );

      if (registeredRows.length === 0) {
        return res.status(403).json({ 
          error: "El DNI ingresado no se encuentra en la lista de postulantes habilitados. Por favor, verifique sus datos o contacte con soporte." 
        });
      }

      const [result] = await pool.query(
        `INSERT INTO preinscripciones (
          nombres, apellido_paterno, apellido_materno, dni, email, telefono, 
          fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, 
          distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, estado, changed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?)`,
        [
          names, paternalSurname, maternalSurname, dni, email, phone,
          birthDate, gender, indigenousPeople, department, province,
          district, schoolName, schoolType, graduationYear, career, modality, changedBy
        ]
      );

      const insertId = (result as any).insertId;

      // Send confirmation email
      await sendEmail(
        email,
        "Confirmación de Inscripción - UNIQ Admisión",
        `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #047857;">¡Inscripción Recibida!</h2>
          <p>Hola <strong>${names}</strong>,</p>
          <p>Hemos recibido correctamente tu solicitud de inscripción para el proceso de admisión de la <strong>Universidad Nacional Intercultural de Quillabamba</strong>.</p>
          <p><strong>Detalles de tu solicitud:</strong></p>
          <ul>
            <li><strong>DNI:</strong> ${dni}</li>
            <li><strong>Carrera:</strong> ${career}</li>
            <li><strong>Modalidad:</strong> ${modality}</li>
            <li><strong>Estado:</strong> Pendiente de revisión</li>
          </ul>
          <p>Te notificaremos por este medio una vez que tu documentación haya sido revisada.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
        `
      );

      res.status(201).json({ id: insertId, status: "Pendiente" });
    } catch (error) {
      handleDbError(res, error, "creating registration");
    }
  });

  // Update registration status
  app.patch("/api/registrations/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, changedBy } = req.body;

      // Fetch user info before update to send email
      const [rows]: any = await pool.query("SELECT nombres, email, carrera FROM preinscripciones WHERE id = ?", [id]);
      
      if (rows.length > 0) {
        const registration = rows[0];
        await pool.query("UPDATE preinscripciones SET estado = ?, changed_by = ? WHERE id = ?", [status, changedBy, id]);

        // Send status update email
        const statusColor = status === "Validado" ? "#047857" : "#b91c1c";
        await sendEmail(
          registration.email,
          `Actualización de Estado: ${status} - UNIQ Admisión`,
          `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: ${statusColor};">Actualización de tu Inscripción</h2>
            <p>Hola <strong>${registration.nombres}</strong>,</p>
            <p>El estado de tu solicitud para la carrera de <strong>${registration.carrera}</strong> ha sido actualizado:</p>
            <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; font-size: 18px; color: ${statusColor};">${status}</p>
            </div>
            ${status === "Observado" ? "<p>Por favor, revisa tu documentación y asegúrate de que todos los datos sean correctos. Si tienes dudas, puedes contactarnos.</p>" : "<p>Tu preinscripción ha sido validada correctamente. ¡Felicidades!</p>"}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Universidad Nacional Intercultural de Quillabamba - Oficina de Admisión</p>
          </div>
          `
        );
      }

      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "updating registration status");
    }
  });

  // Login
  app.post("/api/login", async (req, res) => {
    console.log("[API] Login attempt for user:", req.body.username);
    try {
      const { username, password } = req.body;
      const [rows] = await pool.query(
        "SELECT id, username, role, full_name, email FROM usuarios WHERE (username = ? OR email = ?) AND password = ?",
        [username, username, password]
      );

      const users = rows as any[];
      if (users.length > 0) {
        const user = users[0];
        // Exact match with the provided database schema
        res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email
        });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    } catch (error: any) {
      handleDbError(res, error, "login");
    }
  });

  // User Management API
  app.get("/api/users", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, username, role, full_name, email FROM usuarios");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching users");
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, role, full_name, email } = req.body;
      const [result] = await pool.query(
        "INSERT INTO usuarios (username, password, role, full_name, email) VALUES (?, ?, ?, ?, ?)",
        [username, password, role, full_name, email]
      );
      res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
      handleDbError(res, error, "creating user");
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, role, full_name, email } = req.body;
      
      let query = "UPDATE usuarios SET username = ?, role = ?, full_name = ?, email = ?";
      let params = [username, role, full_name, email];
      
      if (password) {
        query += ", password = ?";
        params.push(password);
      }
      
      query += " WHERE id = ?";
      params.push(id);
      
      await pool.query(query, params);
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "updating user");
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Prevent deleting the main admin
      const [rows]: any = await pool.query("SELECT username FROM usuarios WHERE id = ?", [id]);
      if (rows.length > 0 && rows[0].username === 'admin') {
        return res.status(403).json({ error: "No se puede eliminar al administrador principal" });
      }
      
      await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "deleting user");
    }
  });

  app.get("/api/debug/tables", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SHOW TABLES");
      const tables = rows.map((row: any) => Object.values(row)[0]);
      res.json({ tables });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Registrados Endpoints ---

  app.get("/api/registrados", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM registrados ORDER BY id DESC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching registrados");
    }
  });

  app.post("/api/registrados", async (req, res) => {
    try {
      const { dni, nombres, apellido_paterno, apellido_materno, email, telefono } = req.body;
      await pool.query(
        "INSERT INTO registrados (dni, nombres, apellido_paterno, apellido_materno, email, telefono) VALUES (?, ?, ?, ?, ?, ?)",
        [dni, nombres, apellido_paterno, apellido_materno, email, telefono]
      );
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "adding registrado");
    }
  });

  app.delete("/api/registrados/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM registrados WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "deleting registrado");
    }
  });

  // --- Modalidades Endpoints ---

  app.get("/api/modalidades", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM modalidades ORDER BY id DESC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching modalidades");
    }
  });

  app.post("/api/modalidades", async (req, res) => {
    try {
      const { nombre, fecha_inicio, fecha_fin, deshabilitado } = req.body;
      const fmt_fecha_inicio = fecha_inicio ? fecha_inicio.split('T')[0] : null;
      const fmt_fecha_fin = fecha_fin ? fecha_fin.split('T')[0] : null;
      await pool.query(
        "INSERT INTO modalidades (nombre, fecha_inicio, fecha_fin, deshabilitado) VALUES (?, ?, ?, ?)",
        [nombre, fmt_fecha_inicio, fmt_fecha_fin, deshabilitado ? 1 : 0]
      );
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "adding modalidad");
    }
  });

  app.put("/api/modalidades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, fecha_inicio, fecha_fin, deshabilitado } = req.body;
      const fmt_fecha_inicio = fecha_inicio ? fecha_inicio.split('T')[0] : null;
      const fmt_fecha_fin = fecha_fin ? fecha_fin.split('T')[0] : null;
      await pool.query(
        "UPDATE modalidades SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, deshabilitado = ? WHERE id = ?",
        [nombre, fmt_fecha_inicio, fmt_fecha_fin, deshabilitado ? 1 : 0, id]
      );
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "updating modalidad");
    }
  });

  app.delete("/api/modalidades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM modalidades WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "deleting modalidad");
    }
  });

  // DNI Lookup Proxy
  app.get("/api/dni/:dni", async (req, res) => {
    try {
      const { dni } = req.params;
      
      // Fetch config from DB
      const [rows]: any = await pool.query("SELECT api_url, api_token FROM config_api_dni WHERE id = 1");
      const config = rows[0];
      
      const apiUrl = config?.api_url || "https://dniruc.apisperu.com/api/v1/dni/";
      const apiToken = config?.api_token;

      if (!apiToken) {
        return res.status(400).json({ error: "Token de API DNI no configurado en la base de datos" });
      }

      // Construct URL: baseUrl + dni + ?token=token
      const fullUrl = `${apiUrl}${dni}?token=${apiToken}`;
      
      console.log(`[DNI PROXY] Querying from DB config: ${apiUrl}${dni}`);
      
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error: any) {
      console.error("[DNI PROXY ERROR]", error);
      res.status(500).json({ error: "Error al consultar el servicio de DNI", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
