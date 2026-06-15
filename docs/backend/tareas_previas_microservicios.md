# Tareas Previas a la Creación de los Microservicios

Antes de desacoplar y crear los microservicios obligatorios (Asistencias y Calificaciones), es necesario establecer y finalizar el Core del sistema. Las tareas requeridas son:

## 1. Configuración Inicial del Core (COMPLETADO)
- [x] Configurar el proyecto Spring Boot (Core).
- [x] Configurar la conexión a la base de datos principal.
- [x] Establecer la arquitectura base (Controladores, Servicios, Repositorios).
- [x] Implementar el manejo global de excepciones.

## 2. Seguridad y Accesos (COMPLETADO)
- [x] Implementar Spring Security.
- [x] Configurar autenticación mediante JWT (JSON Web Tokens).
- [x] Desarrollar los CRUDs para la gestión de **Usuarios** y **Roles**.
- [x] Definir políticas de autorización por roles.

## 3. Desarrollo de CRUDs Principales (Dominio Core)
El Core debe centralizar la gestión académica. Se deben desarrollar los siguientes CRUDs y entidades:
- **Actores**: 
  - [ ] Alumnos
  - [ ] Profesores
- **Estructura Académica**:
  - [ ] Carreras
  - [ ] Planes de Estudio
  - [ ] Materias
  - [ ] Cuatrimestres
  - [ ] Comisiones
  - [ ] Horarios y Módulos
- **Procesos**:
  - [ ] Inscripciones a Carreras
  - [ ] Inscripciones a Cursadas (Comisiones)

## 4. Módulos Comunes (Commons)
- [x] Crear una librería o módulo interno (`commons`) para compartir código que los microservicios también necesitarán.
- [x] Definir DTOs base, clases de utilería, constantes y configuraciones comunes.

## 5. Preparación de Comunicación (Opcional en esta etapa, pero necesario previo a conectar MS)
- [ ] Definir la estrategia de comunicación entre el Core y los microservicios (por ejemplo, HTTP/REST, colas de mensajes, etc.).
- [ ] Si aplica, configurar un API Gateway y un Service Discovery (ej. Eureka) para enrutar las peticiones al Core y futuros microservicios.

---
**Nota**: Una vez que el Core esté estable y pueda gestionar las inscripciones y los actores, se podrá proceder de manera independiente con el desarrollo de los microservicios de **Asistencias** y **Notas/Exámenes**.
