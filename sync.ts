
import mysql from 'mysql2/promise';

async function sync() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admision'
  });
  
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  await connection.query("DELETE FROM idiomas");
  const [rows]: any = await connection.query("SELECT DISTINCT idioma FROM mapeo_idiomas");
  for (const row of rows) {
    await connection.query("INSERT INTO idiomas (nombre) VALUES (?)", [row.idioma.toUpperCase()]);
  }
  await connection.commit();
  connection.release();
  console.log("Sync complete");
  process.exit(0);
}

sync();
