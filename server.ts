import express from "express";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Request Logger Middleware
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // Database connection pool
  const dbConfig = {
    host: process.env.DB_HOST || "161.132.41.68",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "uniq_admision",
    password: process.env.DB_PASSWORD || "M1c4s1t4TI.2026",
    database: process.env.DB_NAME || "uniq_admision",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 30000, // Increased to 30 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

  const pool = mysql.createPool(dbConfig);

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
        console.log(`[DB] Attempt ${i + 1}: Connecting to ${dbConfig.host}:${dbConfig.port}...`);
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
          console.error(`[DB] TROUBLESHOOTING: This ETIMEDOUT error means your MySQL server at ${dbConfig.host} is not responding.`);
          console.error("[DB] 1. Check if the MySQL service is running.");
          console.error(`[DB] 2. Check if port ${dbConfig.port} is open in your server's firewall (iptables/ufw/cloud security groups).`);
          console.error("[DB] 3. Ensure MySQL is configured to listen on all interfaces (bind-address = 0.0.0.0).");
          console.error("[DB] 4. IMPORTANT: In cPanel, add IP 34.34.229.3 to 'Remote MySQL' allowed hosts.");
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
      
      // Table for Usuarios
      await connection.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'registrador', 'visualizador') DEFAULT 'visualizador',
          full_name VARCHAR(255),
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default admin if not exists
      await connection.query(`
        INSERT IGNORE INTO usuarios (username, password, role, full_name, email)
        VALUES ('admin', 'admin123', 'admin', 'Administrador UNIQ', 'admision@uniq.edu.pe')
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
          carrera VARCHAR(255),
          modalidad VARCHAR(100),
          estado ENUM('Pendiente', 'Validado', 'Observado') DEFAULT 'Pendiente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

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
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    const newSettings = req.body;
    const currentSettings = await getSettings();
    await saveSettings({ ...currentSettings, ...newSettings });
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/test-json", (req, res) => {
    res.json({ message: "JSON is working", timestamp: new Date().toISOString() });
  });

  app.get("/api/my-ip", async (req, res) => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.json({ ip: "No se pudo determinar (use 34.34.229.3)" });
    }
  });

  app.get("/api/db-status", async (req, res) => {
    try {
      const connection = await pool.getConnection();
      connection.release();
      res.json({ status: "connected", host: dbConfig.host, port: dbConfig.port });
    } catch (error: any) {
      res.status(500).json({ 
        status: "error", 
        code: error.code, 
        message: error.message,
        details: "El servidor de base de datos no responde. Verifique el firewall y la configuración de red."
      });
    }
  });

  const handleDbError = (res: express.Response, error: any, context: string) => {
    console.error(`Error fetching ${context}:`, error);
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ER_HOST_NOT_PRIVILEGED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      res.status(503).json({ 
        error: "Database Connection Error", 
        details: "El servidor de base de datos no responde o el acceso fue denegado. Asegúrese de autorizar la IP 34.34.229.3 en cPanel (Remote MySQL)." 
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Cronograma API
  app.get("/api/cronograma", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM cronograma ORDER BY order_index ASC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "cronograma");
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
      } = req.body;

      const [result] = await pool.query(
        `INSERT INTO preinscripciones (
          nombres, apellido_paterno, apellido_materno, dni, email, telefono, 
          fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, 
          distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
        [
          names, paternalSurname, maternalSurname, dni, email, phone,
          birthDate, gender, indigenousPeople, department, province,
          district, schoolName, schoolType, graduationYear, career, modality
        ]
      );

      const insertId = (result as any).insertId;

      // Send confirmation email
      await sendEmail(
        email,
        "Confirmación de Preinscripción - UNIQ Admisión",
        `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #047857;">¡Preinscripción Recibida!</h2>
          <p>Hola <strong>${names}</strong>,</p>
          <p>Hemos recibido correctamente tu solicitud de preinscripción para el proceso de admisión de la <strong>Universidad Nacional Intercultural de Quillabamba</strong>.</p>
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
      const { status } = req.body;

      // Fetch user info before update to send email
      const [rows]: any = await pool.query("SELECT nombres, email, carrera FROM preinscripciones WHERE id = ?", [id]);
      
      if (rows.length > 0) {
        const registration = rows[0];
        await pool.query("UPDATE preinscripciones SET estado = ? WHERE id = ?", [status, id]);

        // Send status update email
        const statusColor = status === "Validado" ? "#047857" : "#b91c1c";
        await sendEmail(
          registration.email,
          `Actualización de Estado: ${status} - UNIQ Admisión`,
          `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: ${statusColor};">Actualización de tu Preinscripción</h2>
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
      const [rows] = await pool.query("SELECT id, username, role, full_name, email, created_at FROM usuarios ORDER BY created_at DESC");
      res.json(rows);
    } catch (error) {
      handleDbError(res, error, "fetching users");
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, role, full_name, email } = req.body;
      await pool.query(
        "INSERT INTO usuarios (username, password, role, full_name, email) VALUES (?, ?, ?, ?, ?)",
        [username, password, role, full_name, email]
      );
      res.status(201).json({ success: true });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: "El nombre de usuario ya existe" });
      } else {
        handleDbError(res, error, "creating user");
      }
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, role, full_name, email } = req.body;
      
      if (password) {
        await pool.query(
          "UPDATE usuarios SET username = ?, password = ?, role = ?, full_name = ?, email = ? WHERE id = ?",
          [username, password, role, full_name, email, id]
        );
      } else {
        await pool.query(
          "UPDATE usuarios SET username = ?, role = ?, full_name = ?, email = ? WHERE id = ?",
          [username, role, full_name, email, id]
        );
      }
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
