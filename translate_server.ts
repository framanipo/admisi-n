import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const replacements = [
  // usuarios
  ['username VARCHAR', 'nombre_usuario VARCHAR'],
  ['password VARCHAR', 'contrasena VARCHAR'],
  ['role ENUM', 'rol ENUM'],
  ['full_name VARCHAR', 'nombre_completo VARCHAR'],
  ['email VARCHAR(255)', 'correo VARCHAR(255)'],
  ['email VARCHAR', 'correo VARCHAR'],
  
  // registrados
  ['email VARCHAR', 'correo VARCHAR'],
  
  // cronograma
  ['event VARCHAR', 'evento VARCHAR'],
  ['date VARCHAR', 'fecha VARCHAR'],
  ['status ENUM', 'estado ENUM'],
  ['order_index INT', 'indice_orden INT'],
  
  // reglamento
  ['chapter VARCHAR', 'capitulo VARCHAR'],
  ['title VARCHAR', 'titulo VARCHAR'],
  ['content TEXT', 'contenido TEXT'],
  
  // temario
  ['area VARCHAR', 'area_tematica VARCHAR'],
  ['subject VARCHAR', 'materia VARCHAR'],
  ['topics TEXT', 'temas TEXT'],
  
  // resultados
  ['pos INT', 'posicion INT'],
  ['name VARCHAR', 'nombre VARCHAR'],
  ['score VARCHAR', 'puntaje VARCHAR'],
  ['status VARCHAR', 'estado VARCHAR'],
  
  // carreras
  ['name VARCHAR', 'nombre VARCHAR'],
  ['description TEXT', 'descripcion TEXT'],
  ['vacancies INT', 'vacantes INT'],
  
  // config_api_dni
  ['api_url VARCHAR', 'url_api VARCHAR'],
  ['api_token TEXT', 'token_api TEXT'],
  ['updated_at TIMESTAMP', 'fecha_actualizacion TIMESTAMP'],
  
  // preinscripciones
  ['conadis_number VARCHAR', 'numero_conadis VARCHAR'],
  ['is_deportista BOOLEAN', 'es_deportista BOOLEAN'],
  ['is_victima_violencia BOOLEAN', 'es_victima_violencia BOOLEAN'],
  ['is_servicio_militar BOOLEAN', 'es_servicio_militar BOOLEAN'],
  ['is_primeros_puestos BOOLEAN', 'es_primeros_puestos BOOLEAN'],
  ['created_at TIMESTAMP', 'fecha_creacion TIMESTAMP'],
  
  // Queries replacements
  ['SELECT api_url, api_token FROM config_api_dni', 'SELECT url_api AS api_url, token_api AS api_token FROM config_api_dni'],
  ['INSERT INTO config_api_dni (id, api_url, api_token)', 'INSERT INTO config_api_dni (id, url_api, token_api)'],
  ['UPDATE config_api_dni SET api_url = ?, api_token = ?', 'UPDATE config_api_dni SET url_api = ?, token_api = ?'],
  
  ['ORDER BY order_index', 'ORDER BY indice_orden'],
  ['ORDER BY pos', 'ORDER BY posicion'],
  ['ORDER BY created_at', 'ORDER BY fecha_creacion'],
  
  ['SELECT id, username, role, full_name, email FROM usuarios', 'SELECT id, nombre_usuario AS username, rol AS role, nombre_completo AS full_name, correo AS email FROM usuarios'],
  ['username = ?', 'nombre_usuario = ?'],
  ['password = ?', 'contrasena = ?'],
  ['email = ?', 'correo = ?'],
  ['INSERT INTO usuarios (username, password, role, full_name, email)', 'INSERT INTO usuarios (nombre_usuario, contrasena, rol, nombre_completo, correo)'],
  ['UPDATE usuarios SET username = ?, role = ?, full_name = ?, email = ?', 'UPDATE usuarios SET nombre_usuario = ?, rol = ?, nombre_completo = ?, correo = ?'],
  ['UPDATE usuarios SET password = ?', 'UPDATE usuarios SET contrasena = ?'],
  
  ['INSERT INTO cronograma (event, date, status, order_index)', 'INSERT INTO cronograma (evento, fecha, estado, indice_orden)'],
  ['UPDATE cronograma SET event = ?, date = ?, status = ?, order_index = ?', 'UPDATE cronograma SET evento = ?, fecha = ?, estado = ?, indice_orden = ?'],
  
  ['INSERT INTO reglamento (chapter, title, content, order_index)', 'INSERT INTO reglamento (capitulo, titulo, contenido, indice_orden)'],
  ['UPDATE reglamento SET chapter = ?, title = ?, content = ?, order_index = ?', 'UPDATE reglamento SET capitulo = ?, titulo = ?, contenido = ?, indice_orden = ?'],
  
  ['INSERT INTO temario (area, subject, topics, order_index)', 'INSERT INTO temario (area_tematica, materia, temas, indice_orden)'],
  ['UPDATE temario SET area = ?, subject = ?, topics = ?, order_index = ?', 'UPDATE temario SET area_tematica = ?, materia = ?, temas = ?, indice_orden = ?'],
  
  ['INSERT INTO resultados (pos, name, score, status, dni)', 'INSERT INTO resultados (posicion, nombre, puntaje, estado, dni)'],
  ['UPDATE resultados SET pos = ?, name = ?, score = ?, status = ?, dni = ?', 'UPDATE resultados SET posicion = ?, nombre = ?, puntaje = ?, estado = ?, dni = ?'],
  
  ['INSERT INTO carreras (name, description, vacancies)', 'INSERT INTO carreras (nombre, descripcion, vacantes)'],
  ['UPDATE carreras SET name = ?, description = ?, vacancies = ?', 'UPDATE carreras SET nombre = ?, descripcion = ?, vacantes = ?'],
  
  ['INSERT INTO registrados (dni, nombres, apellido_paterno, apellido_materno, email, telefono)', 'INSERT INTO registrados (dni, nombres, apellido_paterno, apellido_materno, correo, telefono)'],
  ['UPDATE registrados SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, email = ?, telefono = ?', 'UPDATE registrados SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, telefono = ?'],
  
  // preinscripciones
  ['INSERT INTO preinscripciones (nombres, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, lugar_inscripcion, colegio_region, colegio_provincia, colegio_distrito, procedencia_region, procedencia_provincia, procedencia_distrito, procedencia_direccion, nacimiento_region, nacimiento_provincia, nacimiento_distrito, idioma, idioma_lee, idioma_habla, idioma_escribe, nombre_apoderado, celular_apoderado, tipo_comunidad, conadis_number, is_deportista, is_victima_violencia, is_servicio_militar, is_primeros_puestos, status)', 
   'INSERT INTO preinscripciones (nombres, apellido_paterno, apellido_materno, dni, correo, telefono, fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, lugar_inscripcion, colegio_region, colegio_provincia, colegio_distrito, procedencia_region, procedencia_provincia, procedencia_distrito, procedencia_direccion, nacimiento_region, nacimiento_provincia, nacimiento_distrito, idioma, idioma_lee, idioma_habla, idioma_escribe, nombre_apoderado, celular_apoderado, tipo_comunidad, numero_conadis, es_deportista, es_victima_violencia, es_servicio_militar, es_primeros_puestos, estado)'],
  
  ['UPDATE preinscripciones SET status = ?, changed_by = ?', 'UPDATE preinscripciones SET estado = ?, changed_by = ?'],
  ['UPDATE preinscripciones SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, email = ?, telefono = ?, fecha_nacimiento = ?, genero = ?, pueblo_indigena = ?, departamento = ?, provincia = ?, distrito = ?, colegio_nombre = ?, colegio_tipo = ?, anio_egreso = ?, carrera = ?, modalidad = ?, lugar_inscripcion = ?, colegio_region = ?, colegio_provincia = ?, colegio_distrito = ?, procedencia_region = ?, procedencia_provincia = ?, procedencia_distrito = ?, procedencia_direccion = ?, nacimiento_region = ?, nacimiento_provincia = ?, nacimiento_distrito = ?, idioma = ?, idioma_lee = ?, idioma_habla = ?, idioma_escribe = ?, nombre_apoderado = ?, celular_apoderado = ?, tipo_comunidad = ?, conadis_number = ?, is_deportista = ?, is_victima_violencia = ?, is_servicio_militar = ?, is_primeros_puestos = ?, changed_by = ?',
   'UPDATE preinscripciones SET nombres = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, telefono = ?, fecha_nacimiento = ?, genero = ?, pueblo_indigena = ?, departamento = ?, provincia = ?, distrito = ?, colegio_nombre = ?, colegio_tipo = ?, anio_egreso = ?, carrera = ?, modalidad = ?, lugar_inscripcion = ?, colegio_region = ?, colegio_provincia = ?, colegio_distrito = ?, procedencia_region = ?, procedencia_provincia = ?, procedencia_distrito = ?, procedencia_direccion = ?, nacimiento_region = ?, nacimiento_provincia = ?, nacimiento_distrito = ?, idioma = ?, idioma_lee = ?, idioma_habla = ?, idioma_escribe = ?, nombre_apoderado = ?, celular_apoderado = ?, tipo_comunidad = ?, numero_conadis = ?, es_deportista = ?, es_victima_violencia = ?, es_servicio_militar = ?, es_primeros_puestos = ?, changed_by = ?'],
   
  ['SELECT nombres, email, carrera FROM preinscripciones', 'SELECT nombres, correo AS email, carrera FROM preinscripciones'],
  
  // Fixes for mapping back to english properties in API responses to avoid breaking App.tsx
  // We alias them in SELECT so App.tsx doesn't need to change for reading.
  ['SELECT * FROM cronograma', 'SELECT id, evento AS event, fecha AS date, estado AS status, indice_orden AS order_index FROM cronograma'],
  ['SELECT * FROM reglamento', 'SELECT id, capitulo AS chapter, titulo AS title, contenido AS content, indice_orden AS order_index FROM reglamento'],
  ['SELECT * FROM temario', 'SELECT id, area_tematica AS area, materia AS subject, temas AS topics, indice_orden AS order_index FROM temario'],
  ['SELECT * FROM resultados', 'SELECT id, posicion AS pos, nombre AS name, puntaje AS score, estado AS status, dni FROM resultados'],
  ['SELECT * FROM carreras', 'SELECT id, nombre AS name, descripcion AS description, vacantes AS vacancies FROM carreras'],
  ['SELECT * FROM registrados', 'SELECT id, dni, nombres, apellido_paterno, apellido_materno, correo AS email, telefono FROM registrados'],
  ['SELECT * FROM preinscripciones', 'SELECT id, nombres, apellido_paterno, apellido_materno, dni, correo AS email, telefono, fecha_nacimiento, genero, pueblo_indigena, departamento, provincia, distrito, colegio_nombre, colegio_tipo, anio_egreso, carrera, modalidad, lugar_inscripcion, colegio_region, colegio_provincia, colegio_distrito, procedencia_region, procedencia_provincia, procedencia_distrito, procedencia_direccion, nacimiento_region, nacimiento_provincia, nacimiento_distrito, idioma, idioma_lee, idioma_habla, idioma_escribe, nombre_apoderado, celular_apoderado, tipo_comunidad, numero_conadis AS conadis_number, es_deportista AS is_deportista, es_victima_violencia AS is_victima_violencia, es_servicio_militar AS is_servicio_militar, es_primeros_puestos AS is_primeros_puestos, estado AS status, fecha_creacion AS created_at, fecha_actualizacion AS updated_at, changed_by FROM preinscripciones'],
];

for (const [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

fs.writeFileSync('server.ts', content);
console.log('server.ts updated');
