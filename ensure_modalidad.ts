import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Checking modalidad column...');
  const [columns]: any = await connection.query("SHOW COLUMNS FROM preinscripciones LIKE 'modalidad'");
  
  if (columns.length === 0) {
    console.log('Adding modalidad column...');
    await connection.query("ALTER TABLE preinscripciones ADD COLUMN modalidad VARCHAR(100) DEFAULT NULL");
    console.log('Column added successfully.');
  } else {
    console.log('modalidad column already exists.');
  }

  await connection.end();
}

migrate().catch(console.error);
