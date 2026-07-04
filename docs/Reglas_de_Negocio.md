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

### 🔴 A corregir primero (bloqueante de seguridad)

- **Alumnos/Profesores pueden loguearse y leer datos ajenos hoy mismo, sin tener UI propia.** `POST /auth/login` no valida `Alumno.activo`/`Profesor.activo` ni ningún flag de habilitación — cualquier Usuario con credenciales válidas obtiene un JWT funcional, tenga o no pantallas pensadas para su rol. Agrava esto que los endpoints de **lectura** (`GET /api/alumnos`, `/api/materias`, etc.) no tienen `@PreAuthorize` — solo los POST/PUT/DELETE están gateados por rol — así que un Alumno logueado puede leer el listado completo de otros alumnos, materias, comisiones, etc. Confirmado con pruebas reales (login exitoso + `GET /api/core/alumnos` → 200 con rol ALUMNO).
  - **Fix propuesto:** agregar columna `enabled` (boolean) a `usuarios`, default `true`, pero `false` al crear un Usuario con rol `ALUMNO` o `PROFESOR` (`UserLookupPortImpl.crearConCredencialesPorDni`). Hacer que `User.isEnabled()` devuelva ese campo en vez de `true` hardcodeado — Spring Security ya rechaza el login solo si `isEnabled()` es `false` (`DisabledException`), sin lógica custom. Cuando exista UI para esos roles, un ADMIN habilita la cuenta puntual.
  - Como fix incremental o complementario, evaluar `@PreAuthorize` en los GET actualmente abiertos.
  - Relacionado: `DELETE /api/core/alumnos/{id}` solo hace baja lógica (`activo=false`) sobre `Alumno`, nunca toca `Usuario` — mismo síntoma, misma causa raíz (falta de vínculo entre estado del actor y estado de la cuenta).
