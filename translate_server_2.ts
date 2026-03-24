import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const replacements = [
  ['has_special_conditions BOOLEAN', 'tiene_condiciones_especiales BOOLEAN'],
  ['changed_by VARCHAR', 'modificado_por VARCHAR'],
  ['changed_by = ?', 'modificado_por = ?'],
  ['changed_by FROM', 'modificado_por AS changed_by FROM'],
  ['has_special_conditions', 'tiene_condiciones_especiales'],
  ['changed_by', 'modificado_por'],
];

for (const [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

fs.writeFileSync('server.ts', content);
console.log('server.ts updated again');
