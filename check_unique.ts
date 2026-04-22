import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

async function run() {
  try {
      const fileData = await fs.readFile(path.join(process.cwd(), 'data', 'db-config.json'), 'utf-8');
      
      // decrypt logic stripped, we can just use the config if it's plaintext
      let config = JSON.parse(fileData);
      const conn = await mysql.createConnection(config);
      
      const [cols] = await conn.query("SHOW COLUMNS FROM preinscripciones");
      console.log("codigo_registro column exists?", (cols as any).some((c: any) => c.Field === 'codigo_registro'));
      
      const [idx] = await conn.query("SHOW INDEX FROM preinscripciones");
      console.log("Indexes on preinscripciones:", (idx as any).map((i: any) => i.Key_name));
      
      const [count] = await conn.query("SELECT COUNT(*) FROM preinscripciones");
      console.log("Count:", count);
      
      await conn.end();
  } catch (e) {
      console.log(e);
  }
}
run();
