-- Script de Base de Datos para Sistema de Admisión
-- Motor: MySQL / MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Estructura de tabla para `usuarios`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('admin','registrador','visualizador') NOT NULL DEFAULT 'visualizador',
  `nombre_completo` varchar(255),
  `correo` varchar(255),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `carreras`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `carreras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `vacantes` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `modalidades`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `modalidades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date,
  `fecha_fin` date,
  `deshabilitado` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `postulantes`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `postulantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_postulante` varchar(20) NOT NULL,
  `tipo_documento` enum('DNI','Carnet de Extranjería') NOT NULL,
  `dni` varchar(12) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` varchar(20) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `celular` varchar(15) NOT NULL,
  `departamento` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `distrito` varchar(100) NOT NULL,
  `colegio_nombre` varchar(200) NOT NULL,
  `colegio_tipo` varchar(50) NOT NULL,
  `anio_egreso` int(4) NOT NULL,
  `carrera_id` int(11) NOT NULL,
  `modalidad_id` int(11) NOT NULL,
  `pueblo_indigena` varchar(50) DEFAULT 'No',
  `estado` enum('Pendiente','Validado','Observado') NOT NULL DEFAULT 'Pendiente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `codigo_postulante` (`codigo_postulante`),
  KEY `fk_carrera` (`carrera_id`),
  KEY `fk_modalidad` (`modalidad_id`),
  CONSTRAINT `fk_carrera` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`),
  CONSTRAINT `fk_modalidad` FOREIGN KEY (`modalidad_id`) REFERENCES `modalidades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Datos de prueba
-- --------------------------------------------------------

-- Insertar Carreras
INSERT INTO `carreras` (`nombre`, `descripcion`, `vacantes`) VALUES
('Ingeniería Agronómica Tropical', 'Desarrollo agrícola sostenible', 40),
('Ingeniería de Alimentos', 'Procesamiento de alimentos', 40),
('Ingeniería Civil', 'Infraestructura', 40),
('Ecoturismo', 'Turismo sostenible', 40);

-- Insertar Modalidades
INSERT INTO `modalidades` (`nombre`) VALUES
('Ordinario'),
('Primeros Puestos'),
('Graduados y Titulados'),
('Traslado Externo'),
('Víctimas del Terrorismo'),
('Personas con Discapacidad'),
('Deportistas Calificados');

-- Insertar Usuarios (Admin y User)
-- Nota: En un sistema real, las contraseñas deben estar hasheadas.
INSERT INTO `usuarios` (`nombre_usuario`, `contrasena`, `rol`, `nombre_completo`, `correo`) VALUES
('admin', 'admin123', 'admin', 'Administrador', 'admin@uniq.edu.pe'),
('user', 'user123', 'visualizador', 'Usuario', 'user@uniq.edu.pe');

-- Insertar Postulantes de prueba
INSERT INTO `postulantes` (`codigo_postulante`, `tipo_documento`, `dni`, `nombres`, `apellido_paterno`, `apellido_materno`, `fecha_nacimiento`, `genero`, `correo`, `celular`, `departamento`, `provincia`, `distrito`, `colegio_nombre`, `colegio_tipo`, `anio_egreso`, `carrera_id`, `modalidad_id`, `pueblo_indigena`, `estado`) VALUES
('UNIQ-001', 'DNI', '72839401', 'MARCO', 'GARCIA', 'LOPEZ', '2005-05-15', 'Masculino', 'marco.garcia@gmail.com', '987654321', 'Madre de Dios', 'Tambopata', 'Tambopata', 'COAR Madre de Dios', 'Estatal', 2023, 3, 1, 'No', 'Validado'),
('UNIQ-002', 'DNI', '45678912', 'ELENA', 'QUISPE', 'MAMANI', '2006-02-20', 'Femenino', 'elena.quispe@outlook.com', '912345678', 'Madre de Dios', 'Tambopata', 'Las Piedras', 'I.E. Santa Rosa', 'Estatal', 2024, 4, 2, 'Andino', 'Pendiente'),
('UNIQ-003', 'DNI', '12345678', 'JORGE', 'HUAMAN', 'ROJAS', '2005-11-10', 'Masculino', 'jorge.huaman@yahoo.com', '998877665', 'Madre de Dios', 'Manu', 'Manu', 'I.E. Fitzcarrald', 'Estatal', 2023, 2, 1, 'No', 'Validado'),
('UNIQ-004', 'DNI', '87654321', 'LUCIA', 'TORRES', 'VELA', '2006-08-05', 'Femenino', 'lucia.torres@gmail.com', '955443322', 'Madre de Dios', 'Tahuamanu', 'Iñapari', 'I.E. Iñapari', 'Estatal', 2024, 1, 1, 'Amazónico', 'Observado');

COMMIT;
