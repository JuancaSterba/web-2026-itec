# Reglas de Negocio y Flujos del Sistema

Este documento centraliza las reglas de negocio críticas para que ningún agente de desarrollo pierda el contexto de cómo deben funcionar los flujos principales del backoffice.

## 1. Flujo de Creación de Actores (Alumnos / Profesores)

**Regla de Oro:** La entidad central de identidad en el sistema es el `Usuario` (gestionado por Spring Security y el ABM de Usuarios). Las entidades `Alumno` y `Profesor` son meramente "Roles" o "Perfiles Académicos" que se vinculan a un `Usuario` físico.

### Diseño Actual del Backend vs. Expectativa del Flujo UI
- **Backend (Diseño Actual):** El endpoint `POST /api/core/alumnos` requiere el `userId` de un usuario preexistente que posea el rol `ALUMNO`. No acepta nombre, apellido ni DNI directamente, ya que estos residen en la entidad `Usuario`.
- **Frontend / UI (Flujo Deseado de Usuario):** A nivel de experiencia de usuario (UX) en el backoffice, el administrador **no debería** tener que ir a "Crear Usuario" y luego ir a "Crear Alumno" y vincularlos manualmente. El flujo debe sentirse integrado. Al llenar un formulario de "Nuevo Alumno" con Nombre, Apellido, DNI, Email, el sistema debe orquestar la creación de ambos.

### Decisión Arquitectónica (Creación Automática en Backend)
Para satisfacer la expectativa de la UI y los requerimientos del negocio (uso exclusivamente administrativo por ahora):
1. **Flujo de UI:** El administrador llena un único formulario de "Nuevo Alumno" o "Nuevo Profesor" con Nombre, Apellido, DNI, Email y datos específicos (legajo). Envía un `POST` a `/api/core/alumnos` o `/api/core/profesores`.
2. **Lógica de Backend (Transaccional):** El servicio correspondiente en el backend (`AlumnoService` / `ProfesorService`) debe interceptar esta petición y:
   - Crear automáticamente el `Usuario` asociado.
   - Asignarle el rol correspondiente (`ALUMNO` o `PROFESOR`).
   - Configurar el `username` igual al DNI.
   - Configurar el `password` igual al DNI (encriptado con BCrypt).
   - Crear la entidad `Alumno` o `Profesor` vinculándola a este nuevo usuario.
3. **Restricción de Acceso:** Dado que por el momento ni alumnos ni profesores usarán la app, esta generación automática de credenciales genéricas (DNI/DNI) es válida y suficiente para mantener la integridad relacional de la BD sin fricción administrativa.
