import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'INSERT IGNORE INTO usuarios (username, password, role, full_name, email)',
  'INSERT IGNORE INTO usuarios (nombre_usuario, contrasena, rol, nombre_completo, correo)'
);

content = content.replace(
  'SELECT username FROM usuarios WHERE id = ?',
  'SELECT nombre_usuario AS username FROM usuarios WHERE id = ?'
);

fs.writeFileSync('server.ts', content);
console.log('Fixed remaining username queries');
