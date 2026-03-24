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
          nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
          contrasena VARCHAR(255) NOT NULL,
          rol ENUM('admin', 'registrador', 'visualizador') DEFAULT 'visualizador',
          nombre_completo VARCHAR(255),
          correo VARCHAR(255)
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
          correo VARCHAR(255),
          telefono VARCHAR(20)
        )
      `);

      // Table for Cronograma
      await connection.query(`
        CREATE TABLE IF NOT EXISTS cronograma (
          id INT AUTO_INCREMENT PRIMARY KEY,
          evento VARCHAR(255) NOT NULL,
          fecha VARCHAR(255) NOT NULL,
          estado ENUM('activo', 'completado', 'pendiente') DEFAULT 'pendiente',
          indice_orden INT DEFAULT 0
        )
      `);

      // Table for Reglamento
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reglamento (
          id INT AUTO_INCREMENT PRIMARY KEY,
          capitulo VARCHAR(255) NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          contenido TEXT NOT NULL,
          indice_orden INT DEFAULT 0
        )
      `);

      // Table for Temario
      await connection.query(`
        CREATE TABLE IF NOT EXISTS temario (
          id INT AUTO_INCREMENT PRIMARY KEY,
          area_tematica VARCHAR(255) NOT NULL,
          materia VARCHAR(255) NOT NULL,
          temas TEXT NOT NULL,
          indice_orden INT DEFAULT 0
        )
      `);

      // Table for Resultados
      await connection.query(`
        CREATE TABLE IF NOT EXISTS resultados (
          id INT AUTO_INCREMENT PRIMARY KEY,
          posicion INT NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          puntaje VARCHAR(50) NOT NULL,
          estado VARCHAR(50) NOT NULL,
          dni VARCHAR(20)
        )
      `);

      // Table for Detalles de Carreras
      await connection.query("DROP TABLE IF EXISTS detalles_carreras");

      // Table for Carreras
      await connection.query("DROP TABLE IF EXISTS carreras");
      await connection.query(`
        CREATE TABLE carreras (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          vacantes INT DEFAULT 40,
          codigo VARCHAR(10)
        )
      `);
      await connection.query(`
        INSERT INTO carreras (nombre, descripcion, vacantes, codigo) VALUES 
        ('Ingeniería Civil', 'Formación en infraestructura y construcción.', 40, 'IC'),
        ('Ingeniería Agronómica Tropical', 'Desarrollo agrícola sostenible en el trópico.', 40, 'IAT'),
        ('Ingeniería de Alimentos', 'Procesamiento y calidad de productos alimenticios.', 40, 'IA'),
        ('Ecoturismo', 'Gestión turística sostenible y conservación.', 40, 'ET'),
        ('Contabilidad', 'Gestión financiera y contable con enfoque intercul...', 40, 'CO'),
        ('Economía', 'Análisis económico para el desarrollo regional y n...', 40, 'EC')
      `);

      // Table for Detalles de Carreras
      await connection.query(`
        CREATE TABLE detalles_carreras (
          id INT AUTO_INCREMENT PRIMARY KEY,
          carrera_id INT NOT NULL,
          descripcion_corta TEXT,
          descripcion_completa TEXT,
          perfil_egresado TEXT,
          campo_laboral TEXT,
          imagen_url VARCHAR(255),
          FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
        )
      `);
      await connection.query(`
        INSERT INTO detalles_carreras (carrera_id, descripcion_corta, descripcion_completa, perfil_egresado, campo_laboral, imagen_url) VALUES 
        (1, 'Infraestructura y construcción.', 'Formación integral en diseño, construcción y gestión de obras civiles.', 'Profesional capaz de proyectar y ejecutar obras de infraestructura.', 'Empresas constructoras, entidades públicas, consultoría.', 'https://picsum.photos/seed/civil/800/400'),
        (2, 'Desarrollo agrícola sostenible.', 'Estudio de sistemas agrícolas adaptados al trópico.', 'Ingeniero con enfoque en sostenibilidad y productividad agrícola.', 'Empresas agroindustriales, investigación, gestión pública.', 'https://picsum.photos/seed/agronomica/800/400'),
        (3, 'Procesamiento y calidad.', 'Ciencia y tecnología aplicada a la transformación de alimentos.', 'Experto en asegurar la calidad y seguridad alimentaria.', 'Industria alimentaria, control de calidad, investigación.', 'https://picsum.photos/seed/alimentos/800/400'),
        (4, 'Gestión turística sostenible.', 'Enfoque en el desarrollo del turismo con responsabilidad ambiental.', 'Gestor de proyectos turísticos y conservación.', 'Agencias de viaje, gestión pública, ONGs ambientales.', 'https://picsum.photos/seed/ecoturismo/800/400'),
        (5, 'Gestión financiera y contable.', 'Formación en contabilidad con enfoque intercultural.', 'Contador con capacidad de gestión financiera y tributaria.', 'Estudios contables, empresas privadas, entidades financieras.', 'https://picsum.photos/seed/contabilidad/800/400'),
        (6, 'Análisis económico.', 'Análisis del desarrollo regional y nacional.', 'Economista con capacidad de análisis y planificación.', 'Entidades estatales, consultoría, investigación económica.', 'https://picsum.photos/seed/economia/800/400')
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
          url_api VARCHAR(255) NOT NULL,
          token_api TEXT NOT NULL,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Table for Configuracion Inicio
      await connection.query(`
        CREATE TABLE IF NOT EXISTS configuracion_inicio (
          id INT PRIMARY KEY DEFAULT 1,
          titulo VARCHAR(255) NOT NULL,
          subtitulo TEXT NOT NULL,
          imagen_url VARCHAR(255) NOT NULL
        )
      `);
      await connection.query(`
        INSERT IGNORE INTO configuracion_inicio (id, titulo, subtitulo, imagen_url)
        VALUES (1, 'Tu futuro comienza aquí', 'Formamos profesionales líderes con visión intercultural y compromiso social.', 'https://picsum.photos/seed/uniq-hero/1920/1080')
      `);

      // Table for Preinscripciones
      await connection.query(`
        CREATE TABLE IF NOT EXISTS preinscripciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombres VARCHAR(255) NOT NULL,
          apellido_paterno VARCHAR(255) NOT NULL,
          apellido_materno VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL,
          correo VARCHAR(255) NOT NULL,
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
          modificado_por VARCHAR(255),
          tiene_condiciones_especiales BOOLEAN DEFAULT FALSE,
          discapacidad BOOLEAN DEFAULT FALSE,
          numero_conadis VARCHAR(50),
          es_deportista BOOLEAN DEFAULT FALSE,
          es_victima_violencia BOOLEAN DEFAULT FALSE,
          es_servicio_militar BOOLEAN DEFAULT FALSE,
          es_primeros_puestos BOOLEAN DEFAULT FALSE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add missing columns if they don't exist
      const [preinscripcionesColumns]: any = await connection.query("SHOW COLUMNS FROM preinscripciones");
      const columnNames = preinscripcionesColumns.map((c: any) => c.Field);
      
      if (!columnNames.includes('numero_conadis')) {
        await connection.query("ALTER TABLE preinscripciones ADD COLUMN numero_conadis VARCHAR(50)");
      }
      if (!columnNames.includes('es_deportista')) {
        await connection.query("ALTER TABLE preinscripciones ADD COLUMN es_deportista BOOLEAN DEFAULT FALSE");
      }
      if (!columnNames.includes('es_victima_violencia')) {
        await connection.query("ALTER TABLE preinscripciones ADD COLUMN es_victima_violencia BOOLEAN DEFAULT FALSE");
      }
      if (!columnNames.includes('es_servicio_militar')) {
        await connection.query("ALTER TABLE preinscripciones ADD COLUMN es_servicio_militar BOOLEAN DEFAULT FALSE");
      }
      if (!columnNames.includes('es_primeros_puestos')) {
        await connection.query("ALTER TABLE preinscripciones ADD COLUMN es_primeros_puestos BOOLEAN DEFAULT FALSE");
      }

      // 2. INSERT INITIAL DATA
      
      // Insert default admin if not exists
      await connection.query(`
        INSERT IGNORE INTO usuarios (nombre_usuario, contrasena, rol, nombre_completo, correo)
        VALUES ('admin', 'admin123', 'admin', 'Administrador UNIQ', 'admision@uniq.edu.pe')
      `);

      // Insert sample registered students
      await connection.query(`
        INSERT IGNORE INTO registrados (dni, nombres, apellido_paterno, apellido_materno, correo, telefono)
        VALUES 
        ('12345678', 'JUAN PABLO', 'PEREZ', 'GARCIA', 'juan.pablo@gmail.com', '987654321'),
        ('87654321', 'MARIA ELENA', 'RODRIGUEZ', 'LOPEZ', 'maria.elena@gmail.com', '912345678')
      `);

      // Insert default DNI config if not exists
      await connection.query(`
        INSERT IGNORE INTO config_api_dni (id, url_api, token_api)
        VALUES (1, 'https://dniruc.apisperu.com/api/v1/dni/', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImZyYW50aGt4eEBnbWFpbC5jb20ifQ.Sd5HK5UM_F5cGwv3iqpVaY5LmntjWOQMEvmDs-vPbjk')
      `);

      // 3. ALTER TABLES (MIGRATIONS)
      const columns = [
        "ALTER TABLE preinscripciones ADD COLUMN anio_egreso INT",
        "ALTER TABLE preinscripciones ADD COLUMN carrera VARCHAR(255)",
        "ALTER TABLE preinscripciones ADD COLUMN modificado_por VARCHAR(255)",
        "ALTER TABLE preinscripciones ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE usuarios ADD COLUMN nombre_completo VARCHAR(255)",
        "ALTER TABLE usuarios ADD COLUMN correo VARCHAR(255)",
        "ALTER TABLE cronograma ADD COLUMN indice_orden INT DEFAULT 0",
        "ALTER TABLE reglamento ADD COLUMN indice_orden INT DEFAULT 0",
        "ALTER TABLE temario ADD COLUMN indice_orden INT DEFAULT 0",
        "ALTER TABLE carreras ADD COLUMN codigo VARCHAR(10)"
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
      const [rows]: any = await pool.query("SELECT url_api AS api_url, token_api AS api_token FROM config_api_dni WHERE id = 1");
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
        const [rows]: any = await pool.query("SELECT url_api AS api_url, token_api AS api_token FROM config_api_dni WHERE id = 1");
        const currentDniConfig = rows[0] || { api_url: '', api_token: '' };
        
        const apiUrl = newSettings.dniApiUrl !== undefined ? newSettings.dniApiUrl : currentDniConfig.api_url;
        const apiToken = newSettings.dniApiToken !== undefined ? newSettings.dniApiToken : currentDniConfig.api_token;
        
        await pool.query(
          "INSERT INTO config_api_dni (id, url_api, token_api) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE url_api = ?, token_api = ?",
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

  // Proxy for Google Places API
  app.get("/api/places/autocomplete", async (req, res) => {
    const { input } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input as string)}&key=${apiKey}&language=es&components=country:pe`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ error: "Failed to fetch places" });
    }
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
      const [manualEventsRaw]: any = await pool.query("SELECT id, evento AS event, fecha AS date, estado AS status, indice_orden AS order_index FROM cronograma ORDER BY indice_orden ASC");
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
              "INSERT INTO cronograma (id, evento, fecha, estado, indice_orden) VALUES (?, ?, ?, ?, ?)",
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
      const [rows] = await pool.query("SELECT id, capitulo AS chapter, titulo AS title, contenido AS content, indice_orden AS order_index FROM reglamento ORDER BY indice_orden ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "reglamento");
    }
  });

  // Temario API
  app.get("/api/temario", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, area_tematica AS area, materia AS subject, temas AS topics, indice_orden AS order_index FROM temario ORDER BY indice_orden ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "temario");
    }
  });

  // Resultados API
  app.get("/api/resultados", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, posicion AS pos, nombre AS name, puntaje AS score, estado AS status, dni FROM resultados ORDER BY posicion ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "resultados");
    }
  });

  // Carreras API
  app.get("/api/carreras", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, nombre AS name, descripcion AS description, vacantes AS vacancies, codigo FROM carreras");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "carreras");
    }
  });

  // Detailed Carreras API
  app.get("/api/carreras-detalladas", async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.id AS carrera_id, c.nombre, c.codigo, d.id AS detalle_id, d.descripcion_corta, d.descripcion_completa, d.perfil_egresado, d.campo_laboral, d.imagen_url 
        FROM carreras c 
        JOIN detalles_carreras d ON c.id = d.carrera_id
      `);
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "carreras-detalladas");
    }
  });

  app.post("/api/carreras", async (req, res) => {
    try {
      const { carrera_id, nombre, descripcion_corta, descripcion_completa, perfil_egresado, campo_laboral, imagen_url } = req.body;
      
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        await connection.query(
          "UPDATE carreras SET nombre = ? WHERE id = ?",
          [nombre, carrera_id]
        );
        
        await connection.query(
          "UPDATE detalles_carreras SET descripcion_corta = ?, descripcion_completa = ?, perfil_egresado = ?, campo_laboral = ?, imagen_url = ? WHERE carrera_id = ?",
          [descripcion_corta, descripcion_completa, perfil_egresado, campo_laboral, imagen_url, carrera_id]
        );
        
        await connection.commit();
        res.json({ success: true });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (error) {
      handleDbError(res, error, "updating career");
    }
  });

  // Get registration by DNI
  app.get("/api/registrations/dni/:dni", async (req, res) => {
    try {
      const { dni } = req.params;
      const [rows] = await pool.query("SELECT id, nombres, apellido_paterno, apellido_materno, documento_numero AS dni, correo AS email, telefono, fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, estado AS status, fecha_creacion AS created_at, fecha_actualizacion AS updated_at, changed_by, tiene_condiciones_especiales AS has_special_conditions, numero_conadis AS conadis_number, es_deportista AS is_deportista, es_victima_violencia AS is_victima_violencia, es_servicio_militar AS is_servicio_militar, es_primeros_puestos AS is_primeros_puestos FROM preinscripciones WHERE documento_numero = ? ORDER BY fecha_creacion DESC LIMIT 1", [dni]);
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
      const [rows] = await pool.query("SELECT id, nombres, apellido_paterno, apellido_materno, documento_numero AS dni, correo AS email, telefono, fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, estado AS status, fecha_creacion AS created_at, fecha_actualizacion AS updated_at, changed_by, tiene_condiciones_especiales AS has_special_conditions, numero_conadis AS conadis_number, es_deportista AS is_deportista, es_victima_violencia AS is_victima_violencia, es_servicio_militar AS is_servicio_militar, es_primeros_puestos AS is_primeros_puestos FROM preinscripciones ORDER BY fecha_creacion DESC");
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
        hasSpecialConditions,
        discapacidad,
        conadisNumber,
        isDeportista,
        isVictimaViolencia,
        isServicioMilitar,
        isPrimerosPuestos,
      } = req.body;

      // Validate if student is in the master list (registrados)
      const [registeredRows]: any = await pool.query(
        "SELECT id, dni, nombres, apellido_paterno, apellido_materno, correo AS email, telefono FROM registrados WHERE dni = ?",
        [dni]
      );

      if (registeredRows.length === 0) {
        return res.status(403).json({ 
          error: "El DNI ingresado no se encuentra en la lista de postulantes habilitados. Por favor, verifique sus datos o contacte con soporte." 
        });
      }

      const [result] = await pool.query(
        `INSERT INTO preinscripciones (
          nombres, apellido_paterno, apellido_materno, documento_numero, correo, telefono, 
          fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, 
          distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, estado, changed_by,
          tiene_condiciones_especiales, discapacidad, numero_conadis, es_deportista, 
          es_victima_violencia, es_servicio_militar, es_primeros_puestos, codigo_registro, documento_tipo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          names, paternalSurname, maternalSurname, dni, email, phone,
          birthDate, gender, indigenousPeople, department, province,
          district, schoolName, schoolType, graduationYear, career, modality, changedBy,
          hasSpecialConditions ? 1 : 0, discapacidad ? 1 : 0, conadisNumber, isDeportista ? 1 : 0,
          isVictimaViolencia ? 1 : 0, isServicioMilitar ? 1 : 0, isPrimerosPuestos ? 1 : 0,
          `UNIQ-${Date.now().toString().slice(-6)}`, 'DNI'
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
      const [rows]: any = await pool.query("SELECT nombres, correo AS email, carrera FROM preinscripciones WHERE id = ?", [id]);
      
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
        "SELECT id, nombre_usuario AS username, rol AS role, nombre_completo AS full_name, correo AS email FROM usuarios WHERE (nombre_usuario = ? OR correo = ?) AND contrasena = ?",
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
      const [rows] = await pool.query("SELECT id, nombre_usuario AS username, rol AS role, nombre_completo AS full_name, correo AS email FROM usuarios");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching users");
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, role, full_name, email } = req.body;
      const [result] = await pool.query(
        "INSERT INTO usuarios (nombre_usuario, contrasena, rol, nombre_completo, correo) VALUES (?, ?, ?, ?, ?)",
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
      
      let query = "UPDATE usuarios SET nombre_usuario = ?, rol = ?, nombre_completo = ?, correo = ?";
      let params = [username, role, full_name, email];
      
      if (password) {
        query += ", contrasena = ?";
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
      const [rows]: any = await pool.query("SELECT nombre_usuario AS username FROM usuarios WHERE id = ?", [id]);
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

  app.get("/api/configuracion-inicio", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM configuracion_inicio WHERE id = 1");
      res.json(rows[0] || { titulo: '', subtitulo: '', imagen_url: '' });
    } catch (error) {
      handleDbError(res, error, "fetching configuracion inicio");
    }
  });

  app.post("/api/configuracion-inicio", async (req, res) => {
    try {
      const { titulo, subtitulo, imagen_url } = req.body;
      await pool.query(
        "UPDATE configuracion_inicio SET titulo = ?, subtitulo = ?, imagen_url = ? WHERE id = 1",
        [titulo, subtitulo, imagen_url]
      );
      res.json({ success: true });
    } catch (error) {
      handleDbError(res, error, "updating configuracion inicio");
    }
  });

  // --- Registrados Endpoints ---

  app.get("/api/registrados", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, dni, nombres, apellido_paterno, apellido_materno, correo AS email, telefono FROM registrados ORDER BY id DESC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching registrados");
    }
  });

  app.post("/api/registrados", async (req, res) => {
    try {
      const { dni, nombres, apellido_paterno, apellido_materno, email, telefono } = req.body;
      await pool.query(
        "INSERT INTO registrados (dni, nombres, apellido_paterno, apellido_materno, correo, telefono) VALUES (?, ?, ?, ?, ?, ?)",
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
      const [rows]: any = await pool.query("SELECT url_api AS api_url, token_api AS api_token FROM config_api_dni WHERE id = 1");
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
