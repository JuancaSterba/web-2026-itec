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

## 2. Pendientes / Deuda Técnica Detectada

### ✅ Resuelto — habilitación de cuenta + lectura de datos maestros

- **Alumnos/Profesores ya no pueden loguearse.** `User` tiene columna `enabled` (default `true`; `false` para roles `ALUMNO`/`PROFESOR`, seteado en `UserLookupPortImpl.crearConCredencialesPorDni` y en `UserServiceImpl.register()`). Hallazgo durante la implementación: `AuthServiceImpl.login()` matchea la password a mano (no pasa por `AuthenticationManager`/`DaoAuthenticationProvider`), así que `isEnabled()` no se validaba solo — se agregó el chequeo explícito ahí, con `DisabledException` → 403 `ACCOUNT_DISABLED`.
- **Los GET de los controladores maestros ahora exigen `hasRole('ADMIN') or hasRole('ADMINISTRATIVO')`** (Alumno, Profesor, Materia, Carrera, PlanEstudio, Comisión, Cuatrimestre, HorarioClase, ModuloHorario, AlumnoCarrera, AlumnoInscripto).
- Validado en Docker real: admin sigue logueando, cuenta deshabilitada rechazada, lectura sin rol correcto rechazada (antes devolvía 200).
- **Pendiente sin resolver todavía:** `DELETE /api/core/alumnos/{id}` sigue sin tocar `Usuario` (solo `Alumno.activo=false`) — ya no importa tanto para el login (la cuenta ya nace deshabilitada), pero si en el futuro se habilita a un alumno real y luego se lo "elimina", su `Usuario` seguiría `enabled=true` y podría seguir logueándose. Evaluar si la baja de `Alumno`/`Profesor` debería también deshabilitar el `Usuario`.
