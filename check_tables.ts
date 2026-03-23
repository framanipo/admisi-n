import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '34.34.229.10',
  user: process.env.DB_USER || 'framanipo',
  password: process.env.DB_PASSWORD || 'framanipo123',
  database: process.env.DB_NAME || 'framanipo',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function checkTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows]: any = await connection.query("SHOW TABLES");
    console.log(JSON.stringify(rows.map((row: any) => Object.values(row)[0])));
    await connection.end();
  } catch (error) {
    console.error(error);
  }
}

checkTables();
