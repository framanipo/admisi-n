import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(/modificado_por AS modificado_por/g, 'modificado_por AS changed_by, tiene_condiciones_especiales AS has_special_conditions');
fs.writeFileSync('server.ts', content);
console.log('Fixed aliases');
