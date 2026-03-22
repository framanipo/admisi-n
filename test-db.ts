import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const dbConfig = {
    host: process.env.DB_HOST || "161.132.41.68",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "uniq_admision",
    password: process.env.DB_PASSWORD || "M1c4s1t4TI.2026",
    database: process.env.DB_NAME || "uniq_admision",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 30000,
  };

  console.log(`Testing POOL connection to ${dbConfig.host}...`);
  console.log(`DB_PASSWORD from env: [${process.env.DB_PASSWORD}]`);
  const pool = mysql.createPool(dbConfig);
  
  try {
    const connection = await pool.getConnection();
    console.log("SUCCESS: Connected to database via POOL!");
    
    const [rows] = await connection.execute("SELECT * FROM usuarios");
    console.log("Users in database:");
    console.log(JSON.stringify(rows, null, 2));
    
    connection.release();
    await pool.end();
  } catch (error: any) {
    console.error("ERROR:", error.code, "-", error.message);
  }
}

test();
