import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

dotenv.config({ override: true });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "uniq_admision_secret_key_2026_!!"; // 32 chars
const IV_LENGTH = 16;

function decrypt(text: string) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}

async function getDbConfig() {
  const DB_CONFIG_FILE = path.join(process.cwd(), 'data', 'db-config.json');
  try {
    const data = await fs.readFile(DB_CONFIG_FILE, 'utf-8');
    let configData = data;
    if (data.includes(':')) {
      configData = decrypt(data);
    }
    return JSON.parse(configData);
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

async function run() {
  const config = await getDbConfig();
  const connection = await mysql.createConnection(config);
  
  try {
    console.log("Connected to DB. Starting migration...");

    // 1. Create tipos_examen
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tipos_examen (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        codigo VARCHAR(255) NOT NULL,
        precio VARCHAR(255) NOT NULL,
        precio_privado VARCHAR(20) DEFAULT NULL,
        amazonico TINYINT(1) NOT NULL DEFAULT 0,
        deshabilitado TINYINT(1) NOT NULL DEFAULT 0,
        visible_hasta DATETIME DEFAULT NULL,
        descentralizado TINYINT(1) NOT NULL DEFAULT 0,
        pedir_documentacion TINYINT(4) NOT NULL DEFAULT 2,
        anio INT(11) NOT NULL,
        ide_esp INT(11) NOT NULL,
        ide_itm VARCHAR(6) NOT NULL,
        creado_en TIMESTAMP NULL DEFAULT NULL,
        actualizado_en TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Copy data to tipos_examen
    await connection.execute(`
      INSERT IGNORE INTO tipos_examen (id, titulo, codigo, precio, precio_privado, amazonico, deshabilitado, visible_hasta, descentralizado, pedir_documentacion, anio, ide_esp, ide_itm, creado_en, actualizado_en)
      SELECT id, title, code, price, price_private, amazonic, disabled, visible_until, decentralized, ask_for_documentation, year, ide_esp, ide_itm, created_at, updated_at
      FROM type_exams;
    `);

    // 3. Create colegios
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS colegios (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        nivel VARCHAR(255) DEFAULT NULL,
        gestion VARCHAR(255) DEFAULT NULL,
        distrito_id INT(10) UNSIGNED NOT NULL,
        creado_en TIMESTAMP NULL DEFAULT NULL,
        actualizado_en TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Copy data to colegios by joining schools, school_levels, type_managements
    await connection.execute(`
      INSERT IGNORE INTO colegios (id, codigo, nombre, direccion, nivel, gestion, distrito_id, creado_en, actualizado_en)
      SELECT 
        s.id, 
        s.code, 
        s.title, 
        s.address, 
        sl.title as nivel, 
        tm.title as gestion, 
        s.district_id, 
        s.created_at, 
        s.updated_at
      FROM schools s
      LEFT JOIN school_levels sl ON s.school_level_id = sl.id
      LEFT JOIN type_managements tm ON s.type_management_id = tm.id;
    `);

    // 5. Drop old tables
    await connection.execute("DROP TABLE IF EXISTS schools");
    await connection.execute("DROP TABLE IF EXISTS school_levels");
    await connection.execute("DROP TABLE IF EXISTS type_managements");
    await connection.execute("DROP TABLE IF EXISTS type_exams");

    console.log("Migration completed successfully.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await connection.end();
  }
}

run();
