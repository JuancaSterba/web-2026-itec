# Plan de Implementación de CRUDs por Aplicación/Microservicio

Basado en la arquitectura del sistema, la lógica se divide en una aplicación principal (Core) y dos microservicios independientes obligatorios: Asistencias y Calificaciones (Notas).

## 1. Aplicación Principal (Core)
Centraliza la gestión académica, la seguridad y la estructura de datos fundamentales.

*   **Seguridad y Accesos**
    *   Usuarios (CRUD)
    *   Roles (CRUD)
*   **Actores**
    *   Alumnos (CRUD)
    *   Profesores (CRUD)
*   **Estructura Académica**
    *   Carreras, Planes de Estudio y Materias (CRUD)
    *   Cuatrimestres y Comisiones (CRUD)
    *   Horarios y Módulos (CRUD)
*   **Inscripciones**
    *   Inscripciones a Carreras
    *   Inscripciones a Cursadas

## 2. Microservicio de Asistencias (Obligatorio)
Microservicio desacoplado para el seguimiento de la asistencia y la regularidad.

*   **Asistencias**
    *   `POST /asistencias` (Registrar asistencia por clase/alumno)
    *   `GET /asistencias` (Consultar asistencias)
    *   `PUT /asistencias/{id}` (Actualizar registro de asistencia)
    *   `DELETE /asistencias/{id}` (Eliminar registro)

## 3. Microservicio de Calificaciones / Notas (Obligatorio)
Microservicio desacoplado para el registro de parciales, finales y evaluaciones.

*   **Notas / Calificaciones**
    *   `POST /notas` (Registrar nota parcial o final)
    *   `GET /notas` (Consultar notas de un alumno/comisión)
    *   `PUT /notas/{id}` (Modificar nota)
    *   `DELETE /notas/{id}` (Eliminar nota)
*   **Exámenes (Tipos de Evaluación)**
    *   `POST /examenes` (Crear examen/instancia de evaluación)
    *   `GET /examenes` (Listar evaluaciones de una comisión)
    *   `PUT /examenes/{id}` (Modificar examen)
    *   `DELETE /examenes/{id}` (Eliminar examen)
