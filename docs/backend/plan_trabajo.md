# Plan de Arquitectura y Trabajo: Core & Microservicios

Este documento unifica la estrategia arquitectónica y las tareas necesarias para construir el ecosistema del sistema, dividiendo responsabilidades entre el Monolito Core y los Microservicios independientes.

## 1. Arquitectura del Sistema
La arquitectura general orquestada por Docker Compose estará compuesta por:
- **API Gateway (Puerto 8080):** Puerta de entrada única que ruteará las peticiones (ej. desde el Frontend) y opcionalmente validará los tokens JWT centralizados.
- **Backend Core (Monolito Principal):** Dueño de la estructura maestra, identidad de usuarios y matriculación.
- **Microservicio Asistencias:** Servicio transaccional, enfocado estrictamente en el control de asistencias por comisión.
- **Microservicio Calificaciones:** Servicio transaccional, enfocado en la gestión de instancias evaluativas y notas.
- **Frontend (Next.js):** Aplicación cliente (Puerto 3000).

### 1.1 Estrategia de Base de Datos (Aislamiento Lógico)
Para evitar la sobrecarga operativa y mantener la separación arquitectónica, se utilizará un enfoque de **Aislamiento Lógico**:
- Habrá **un único contenedor de servidor de Base de Datos** (`itec-mysql`).
- Dentro de este servidor, se crearán esquemas (bases de datos lógicas) separados para garantizar que no existan dependencias directas ni JOINs entre servicios:
  - `db_core`: Administra datos maestros (Alumnos, Profesores, Materias, Inscripciones).
  - `db_asistencias`: Guarda solo los IDs del alumno y comisión para registrar el presentismo.
  - `db_calificaciones`: Guarda solo los IDs del alumno y comisión para registrar las notas.
- **Comunicación de datos**: Si un microservicio necesita el "Nombre" de un alumno, deberá consultar su ID mediante una llamada de API al Core (o el Frontend orquestará ambas llamadas).
---

## 2. Fase 1: Desarrollo del Backend Core (En progreso)
El Core centraliza la gestión académica y la seguridad. Todo el trabajo de esta fase se realiza **dentro de la carpeta `backend/`**.

### 2.1 Configuración Inicial y Seguridad (COMPLETADO)
- [x] Configurar el proyecto Spring Boot (Core).
- [x] Configurar la conexión a la base de datos principal.
- [x] Establecer la arquitectura base (Controladores, Servicios, Repositorios).
- [x] Implementar el manejo global de excepciones.
- [x] Implementar Spring Security.
- [x] Configurar autenticación mediante JWT (JSON Web Tokens).
- [x] Desarrollar los CRUDs para la gestión de **Usuarios** y **Roles**.
- [x] Definir políticas de autorización por roles.
- [x] Crear una librería interna (`commons`) para DTOs y utilidades.

### 2.2 Desarrollo de CRUDs de Estructura Maestra (Pendiente)
*Estos CRUDs conforman la base de datos que consumirán los demás microservicios. Deben implementarse en el siguiente orden sugerido dentro del proyecto `backend/`:*

- **Estructura Académica Base**:
  - [ ] Carreras
  - [ ] Planes de Estudio
  - [ ] Materias
- **Actores**: 
  - [ ] Alumnos
  - [ ] Profesores
- **Estructura Dinámica**:
  - [ ] Cuatrimestres
  - [ ] Comisiones
  - [ ] Horarios y Módulos
- **Procesos (Transacciones Core)**:
  - [ ] Inscripciones a Carreras
  - [ ] Inscripciones a Cursadas (Comisiones)

> **Regla de oro:** *Solo cuando el Alumno pueda estar inscripto a una Comisión, el Core se considerará estable para pasar a la Fase 2.*

---

## 3. Fase 2: Desacoplamiento y Microservicios (A futuro)
Una vez finalizada la Fase 1, se crearán nuevos proyectos al mismo nivel en la raíz del repositorio (`web-2026-itec/`).

### 3.1 Infraestructura Docker y Red
- [ ] Crear el proyecto `api-gateway` (Spring Cloud Gateway) para enrutar tráfico a los distintos servicios.
- [ ] Consolidar un archivo `docker-compose.yml` en la raíz del repositorio que levante el Frontend, el Gateway, el Core, los nuevos microservicios y la base de datos.

### 3.2 Microservicio de Asistencias (Nuevo proyecto: `ms-asistencias`)
Liviano y centrado en una sola tarea. Solo guardará los IDs del Alumno y la Comisión, provistos por el Core.
- [ ] `POST /api/asistencias` (Registrar asistencia por clase/alumno)
- [ ] `GET /api/asistencias` (Consultar asistencias)
- [ ] `PUT /api/asistencias/{id}` (Actualizar registro de asistencia)
- [ ] `DELETE /api/asistencias/{id}` (Eliminar registro)

### 3.3 Microservicio de Calificaciones (Nuevo proyecto: `ms-notas`)
Independiente y enfocado a evaluaciones académicas.
- **Tipos de Evaluación (Exámenes)**
  - [ ] `POST /api/examenes` (Crear examen/instancia de evaluación)
  - [ ] `GET /api/examenes` (Listar evaluaciones de una comisión)
  - [ ] `PUT /api/examenes/{id}` (Modificar examen)
  - [ ] `DELETE /api/examenes/{id}` (Eliminar examen)
- **Notas / Calificaciones**
  - [ ] `POST /api/notas` (Registrar nota parcial o final)
  - [ ] `GET /api/notas` (Consultar notas de un alumno/comisión)
  - [ ] `PUT /api/notas/{id}` (Modificar nota)
  - [ ] `DELETE /api/notas/{id}` (Eliminar nota)
