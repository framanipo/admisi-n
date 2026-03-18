# Instrucciones para la Base de Datos (MySQL)

Este proyecto incluye un script SQL para configurar la base de Datos en MySQL/MariaDB, ideal para ser usado con **phpMyAdmin**.

## Pasos para la Importación:

1.  **Abrir phpMyAdmin**: Accede a tu panel de control de phpMyAdmin.
2.  **Crear Base de Datos**:
    *   Haz clic en "Nueva" (New).
    *   Nombre de la base de datos: `admision_db` (o el nombre que prefieras).
    *   Cotejamiento: `utf8mb4_unicode_ci`.
3.  **Seleccionar la Base de Datos**: Haz clic en el nombre de la base de datos recién creada en la barra lateral izquierda.
4.  **Importar el Script**:
    *   Haz clic en la pestaña **"Importar"** (Import) en el menú superior.
    *   Haz clic en "Seleccionar archivo" (Choose File) y busca el archivo `database.sql` que se encuentra en la raíz de este proyecto.
    *   Desplázate hacia abajo y haz clic en el botón **"Importar"** (Go).

## Estructura de Tablas:

*   `usuarios`: Almacena las credenciales de acceso (admin/user).
*   `carreras`: Catálogo de carreras profesionales disponibles.
*   `modalidades`: Diferentes modalidades de admisión.
*   `postulantes`: Registro detallado de cada preinscripción, vinculada a una carrera y modalidad.

## Datos Iniciales:

El script ya incluye:
*   Las 4 carreras profesionales del sistema.
*   Las 7 modalidades de admisión.
*   2 usuarios de prueba:
    *   Admin: `admin` / `admin123`
    *   User: `user` / `user123`
*   4 postulantes de prueba con diferentes estados (Validado, Pendiente, Observado).
