import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function describeTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows]: any = await connection.query('DESCRIBE modalidades');
  console.log(rows);
  await connection.end();
}

describeTable();
