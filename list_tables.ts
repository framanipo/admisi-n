import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

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
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
  }
}

async function listTables() {
  const config = await getDbConfig();
  const connection = await mysql.createConnection(config);

  try {
    const [tables]: any = await connection.query("SHOW TABLES");
    console.log("Tables in database:");
    tables.forEach((table: any) => console.log(`- ${Object.values(table)[0]}`));
  } catch (err: any) {
    console.error("Error listing tables:", err.message);
  } finally {
    await connection.end();
  }
}

listTables();
