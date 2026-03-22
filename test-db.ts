import mysql from "mysql2/promise";
async function test() {
  const pool = mysql.createPool({
    host: "155.248.226.7",
    port: 3306,
    user: "atenea",
    password: "W6CzP5dTH2tWRiGe",
    database: "uniq_admision"
  });
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS app_settings (setting_key VARCHAR(255) PRIMARY KEY, setting_value TEXT)");
    console.log("Table created or exists");
    const [rows] = await pool.query("SELECT * FROM app_settings");
    console.log(rows);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
test();
