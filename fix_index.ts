import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /await connection\.query\("ALTER TABLE preinscripciones ADD UNIQUE KEY unique_dni_modalidad \(dni, modalidad\)"\);/g;

const newCode = `await connection.query("ALTER TABLE preinscripciones ADD UNIQUE KEY unique_dni_modalidad (dni, modalidad)");\n          try { await connection.query("ALTER TABLE preinscripciones ADD INDEX idx_fecha_creacion (fecha_creacion)"); } catch(e) {}`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced idx_fecha_creacion");
}

const reqRegex = /ORDER BY p\.fecha_creacion DESC/g;
if (reqRegex.test(content)) {
  console.log("Found ORDER BY p.fecha_creacion DESC");
}

