import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /"ALTER TABLE mapeo_idiomas ADD COLUMN orden INT DEFAULT 0",\s+"ALTER TABLE codigo_segurida MODIFY COLUMN codigo VARCHAR\(10\) NOT NULL"/s;

const newCode = `"ALTER TABLE mapeo_idiomas ADD COLUMN orden INT DEFAULT 0",\n        "ALTER TABLE codigo_segurida ADD COLUMN modalidad VARCHAR(100)",\n        "ALTER TABLE codigo_segurida DROP INDEX unique_dni",\n        "ALTER TABLE codigo_segurida ADD UNIQUE KEY unique_dni_modalidad_codigo (dni, modalidad)",\n        "ALTER TABLE codigo_segurida MODIFY COLUMN codigo VARCHAR(10) NOT NULL"`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced");
} else {
  console.log("Not replaced");
}
