import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function describeTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [r] = await connection.query("DESCRIBE regions");
  console.log("regions:", r);
  const [p] = await connection.query("DESCRIBE provinces");
  console.log("provinces:", p);
  const [d] = await connection.query("DESCRIBE districts");
  console.log("districts:", d);
  await connection.end();
}

describeTables();
