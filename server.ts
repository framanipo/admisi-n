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

  // Database connection pool
  const dbConfig = {
    host: process.env.DB_HOST || "155.248.226.7",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "atenea",
    password: process.env.DB_PASSWORD || "W6CzP5dTH2tWRiGe",
    database: process.env.DB_NAME || "uniq_admision",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 20000, // 20 seconds
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
  const testConnection = async (retries = 2) => {
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
          console.error("[DB] TROUBLESHOOTING: This ETIMEDOUT error means your MySQL server at 155.248.226.7 is not responding.");
          console.error("[DB] 1. Check if the MySQL service is running.");
          console.error("[DB] 2. Check if port 3306 is open in your server's firewall (iptables/ufw/cloud security groups).");
          console.error("[DB] 3. Ensure MySQL is configured to listen on all interfaces (bind-address = 0.0.0.0).");
        }
      }
    }
    return false;
  };

  testConnection();

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

  // Get all registrations
  app.get("/api/registrations", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM preinscripciones ORDER BY created_at DESC");
      res.json(rows);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Internal Server Error" });
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
      console.error("Error creating registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
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
      console.error("Error updating registration status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const [rows] = await pool.query(
        "SELECT username, role, full_name FROM usuarios WHERE username = ? AND password = ?",
        [username, password]
      );

      const users = rows as any[];
      if (users.length > 0) {
        res.json(users[0]);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal Server Error" });
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
