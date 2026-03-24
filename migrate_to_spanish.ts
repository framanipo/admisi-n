import mysql from 'mysql2/promise';

const dbConfig = {
  host: '155.248.226.7',
  user: 'uniq_admision',
  password: 'M1c4s1t4TI.2026',
  database: 'uniq_admision',
  port: 3306,
};

async function migrate() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to DB");

    // Helper to safely execute queries
    const exec = async (query: string) => {
      try {
        await connection.query(query);
        console.log("SUCCESS:", query);
      } catch (e: any) {
        console.log("SKIPPED/ERROR:", query, "->", e.message);
      }
    };

    // 1. usuarios
    await exec("ALTER TABLE usuarios RENAME COLUMN username TO nombre_usuario");
    await exec("ALTER TABLE usuarios RENAME COLUMN password TO contrasena");
    await exec("ALTER TABLE usuarios RENAME COLUMN role TO rol");
    await exec("ALTER TABLE usuarios RENAME COLUMN full_name TO nombre_completo");
    await exec("ALTER TABLE usuarios RENAME COLUMN email TO correo");

    // 2. registrados
    await exec("ALTER TABLE registrados RENAME COLUMN email TO correo");

    // 3. cronograma
    await exec("ALTER TABLE cronograma RENAME COLUMN event TO evento");
    await exec("ALTER TABLE cronograma RENAME COLUMN date TO fecha");
    await exec("ALTER TABLE cronograma RENAME COLUMN status TO estado");
    await exec("ALTER TABLE cronograma RENAME COLUMN order_index TO indice_orden");

    // 4. reglamento
    await exec("ALTER TABLE reglamento RENAME COLUMN chapter TO capitulo");
    await exec("ALTER TABLE reglamento RENAME COLUMN title TO titulo");
    await exec("ALTER TABLE reglamento RENAME COLUMN content TO contenido");
    await exec("ALTER TABLE reglamento RENAME COLUMN order_index TO indice_orden");

    // 5. temario
    await exec("ALTER TABLE temario RENAME COLUMN area TO area_tematica"); // area is already spanish, but let's be clear
    await exec("ALTER TABLE temario RENAME COLUMN subject TO materia");
    await exec("ALTER TABLE temario RENAME COLUMN topics TO temas");
    await exec("ALTER TABLE temario RENAME COLUMN order_index TO indice_orden");

    // 6. resultados
    await exec("ALTER TABLE resultados RENAME COLUMN pos TO posicion");
    await exec("ALTER TABLE resultados RENAME COLUMN name TO nombre");
    await exec("ALTER TABLE resultados RENAME COLUMN score TO puntaje");
    await exec("ALTER TABLE resultados RENAME COLUMN status TO estado");

    // 7. carreras
    await exec("ALTER TABLE carreras RENAME COLUMN name TO nombre");
    await exec("ALTER TABLE carreras RENAME COLUMN description TO descripcion");
    await exec("ALTER TABLE carreras RENAME COLUMN vacancies TO vacantes");

    // 8. config_api_dni
    await exec("ALTER TABLE config_api_dni RENAME COLUMN api_url TO url_api");
    await exec("ALTER TABLE config_api_dni RENAME COLUMN api_token TO token_api");
    await exec("ALTER TABLE config_api_dni RENAME COLUMN updated_at TO fecha_actualizacion");

    // 9. preinscripciones
    await exec("ALTER TABLE preinscripciones RENAME COLUMN email TO correo");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN conadis_number TO numero_conadis");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN is_deportista TO es_deportista");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN is_victima_violencia TO es_victima_violencia");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN is_servicio_militar TO es_servicio_militar");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN is_primeros_puestos TO es_primeros_puestos");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN status TO estado");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN created_at TO fecha_creacion");
    await exec("ALTER TABLE preinscripciones RENAME COLUMN updated_at TO fecha_actualizacion");

    await connection.end();
    console.log("Migration finished");
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

migrate();
