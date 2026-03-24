import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  'UPDATE usuarios SET nombre_usuario = ?, role = ?, full_name = ?, correo = ?',
  'UPDATE usuarios SET nombre_usuario = ?, rol = ?, nombre_completo = ?, correo = ?'
);

fs.writeFileSync('server.ts', content);
console.log('Fixed UPDATE usuarios');
