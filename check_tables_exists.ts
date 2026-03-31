import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows]: any = await connection.query("SHOW TABLES");
  console.log(rows);
  await connection.end();
}

checkTables();
