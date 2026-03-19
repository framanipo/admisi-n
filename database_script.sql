-- Script de Base de Datos para Sistema de Admisión UNIQ
-- Generado para MySQL / PHPMyAdmin

CREATE DATABASE IF NOT EXISTS uniq_admision;
USE uniq_admision;

-- Tabla de Usuarios (Administradores, Registradores y Visualizadores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'registrador', 'visualizador') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Carreras
CREATE TABLE IF NOT EXISTS carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    vacantes INT DEFAULT 0
);

-- Tabla de Preinscripciones
CREATE TABLE IF NOT EXISTS preinscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_registro VARCHAR(20) NOT NULL UNIQUE,
    documento_tipo ENUM('DNI', 'CE') NOT NULL,
    documento_numero VARCHAR(15) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    pueblo_indigena VARCHAR(100),
    discapacidad VARCHAR(100),
    
    -- Datos Académicos
    colegio_nombre VARCHAR(150) NOT NULL,
    colegio_tipo ENUM('Estatal', 'Particular') NOT NULL,
    egreso_anio YEAR NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    distrito VARCHAR(50) NOT NULL,
    
    -- Postulación
    carrera_id INT,
    modalidad VARCHAR(100) NOT NULL,
    
    -- Estado y Auditoría
    estado ENUM('Pendiente', 'Validado', 'Observado') DEFAULT 'Pendiente',
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
);

-- Insertar datos iniciales de Carreras
INSERT INTO carreras (nombre, descripcion, vacantes) VALUES
('Ingeniería Civil', 'Formación en infraestructura y construcción.', 40),
('Ingeniería Agronómica Tropical', 'Desarrollo agrícola sostenible en el trópico.', 40),
('Ingeniería de Alimentos', 'Procesamiento y calidad de productos alimenticios.', 40),
('Ecoturismo', 'Gestión turística sostenible y conservación.', 40),
('Contabilidad', 'Gestión financiera y contable con enfoque intercultural.', 40),
('Economía', 'Análisis económico para el desarrollo regional y nacional.', 40);

-- Insertar Usuario Administrador por defecto
-- Nota: La contraseña 'admin123' debería ser hasheada en un sistema real
INSERT INTO usuarios (username, password, role, full_name, email) VALUES
('admin', 'admin123', 'admin', 'Administrador Principal', 'admin@uniq.edu.pe'),
('registrador1', 'reg123', 'registrador', 'Juan Pérez', 'jperez@uniq.edu.pe'),
('visualizador1', 'vis123', 'visualizador', 'Maria Garcia', 'mgarcia@uniq.edu.pe');

-- Insertar algunas preinscripciones de ejemplo
INSERT INTO preinscripciones (
    codigo_registro, documento_tipo, documento_numero, nombres, apellido_paterno, apellido_materno, 
    fecha_nacimiento, genero, email, telefono, colegio_nombre, colegio_tipo, egreso_anio, 
    departamento, provincia, distrito, carrera_id, modalidad
) VALUES
('UNIQ-1234', 'DNI', '70654321', 'Ana Maria', 'Quispe', 'Mamani', '2005-05-15', 'Femenino', 'ana.quispe@gmail.com', '987654321', 'I.E. Manco II', 'Estatal', 2023, 'Cusco', 'La Convención', 'Santa Ana', 1, 'Ordinario'),
('UNIQ-5678', 'DNI', '71234567', 'Carlos Alberto', 'Condori', 'Flores', '2006-02-20', 'Masculino', 'carlos.condori@gmail.com', '912345678', 'I.E. La Inmaculada', 'Particular', 2024, 'Cusco', 'La Convención', 'Santa Ana', 2, 'Primeros Puestos');
