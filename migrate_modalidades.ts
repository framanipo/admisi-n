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

  console.log('Starting migration for modalidades table...');

  try {
    // Add new columns if they don't exist
    const columnsToAdd = [
      { name: 'codigo', type: 'VARCHAR(50)' },
      { name: 'amazonico', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'descentralizado', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'pedir_documentacion', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'anio', type: 'INT' },
      { name: 'fecha', type: 'DATE' },
      { name: 'habilitado', type: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of columnsToAdd) {
      try {
        await connection.query(`ALTER TABLE modalidades ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
          console.log(`Column ${col.name} already exists`);
        } else {
          throw e;
        }
      }
    }

    // Rename columns if they exist with old names
    const renames = [
      { old: 'precio_nacional', new: 'costo_nacional', type: 'DECIMAL(10,2) DEFAULT 0' },
      { old: 'precio_privado', new: 'costo_privado', type: 'DECIMAL(10,2) DEFAULT 0' }
    ];

    for (const rename of renames) {
      try {
        // Check if old column exists
        const [rows]: any = await connection.query(`SHOW COLUMNS FROM modalidades LIKE '${rename.old}'`);
        if (rows.length > 0) {
          await connection.query(`ALTER TABLE modalidades CHANGE ${rename.old} ${rename.new} ${rename.type}`);
          console.log(`Renamed ${rename.old} to ${rename.new}`);
        } else {
          console.log(`Column ${rename.old} does not exist, checking if ${rename.new} exists...`);
          const [newRows]: any = await connection.query(`SHOW COLUMNS FROM modalidades LIKE '${rename.new}'`);
          if (newRows.length === 0) {
             await connection.query(`ALTER TABLE modalidades ADD COLUMN ${rename.new} ${rename.type}`);
             console.log(`Added column ${rename.new}`);
          }
        }
      } catch (e) {
        console.error(`Error renaming/adding ${rename.new}:`, e);
      }
    }

    // Sync habilitado with deshabilitado if deshabilitado exists
    try {
      const [rows]: any = await connection.query(`SHOW COLUMNS FROM modalidades LIKE 'deshabilitado'`);
      if (rows.length > 0) {
        await connection.query(`UPDATE modalidades SET habilitado = NOT deshabilitado`);
        console.log('Synced habilitado with deshabilitado');
      }
    } catch (e) {
      console.error('Error syncing habilitado:', e);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
