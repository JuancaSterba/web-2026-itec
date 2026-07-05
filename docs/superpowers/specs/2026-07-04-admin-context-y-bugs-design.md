# Bugfix Teléfonos + Selector de Perfil — Design Spec

**Fecha:** 2026-07-04
**Origen:** `.remember/PENDIENTES.md` → "Bugfix Alumnos (Teléfonos)" y "Selector de Perfil (Context Switcher)" (últimas dos tareas pendientes; "Gestión de Administradores" ya se completó y mergeó a `develop` en esta misma sesión)
**Rama:** `feature/admin-context-y-bugs`

Dos subsistemas independientes, un solo spec/plan por decisión del usuario (ambos chicos, misma rama).

## Contexto

Infraestructura relevante ya existente:
- `User.java` (`backend/commons/.../model/User.java`): campos `nombre, apellido, dni, email, telefono, roles (Set<Rol>), enabled`, con `@UniqueConstraint` en `username/dni/email/telefono`.
- `Profesor.java` (`backend/core/.../model/Profesor.java`): tiene su propio campo `telefonoContacto` (obligatorio hoy), relación `@OneToOne` con `User`.
- `Alumno.java`: `id, legajo (unique), activo, carreras, user (@OneToOne)`. Sin campo de teléfono propio.
- `AlumnoServiceImpl.actualizar()` hoy solo actualiza `legajo` y `activo`. `crearConUsuario()` delega en `UserLookupPortImpl.crearConCredencialesPorDni(...)`.
- `UserLookupPortImpl.crearConCredencialesPorDni(nombre, apellido, dni, email, telefono, rol)`: valida unicidad de username/dni/email/telefono antes de crear. Usado tanto por alta de Alumno como de Profesor.
- Frontend: `alumno-form-dialog.tsx` en edición solo muestra legajo+estado (sin teléfono). `header.tsx` NO usa `useAuth()` — lee `localStorage` directo en un `useEffect` propio, desincronizado del contexto global.
- `seleccionar-rol/page.tsx`: ya implementa el mecanismo de "elegir rol activo" 100% client-side (sin llamar al backend) — el JWT ya trae **todos** los roles del usuario (`localStorage.roles`), y `user-role` en localStorage es simplemente el rol activo elegido. Este mecanismo se reutiliza/centraliza, no se reinventa.
- No hay Flyway/Liquibase — `ddl-auto: update` en dev/local. Proyecto en fase de desarrollo: migración de datos existentes no es necesaria, se puede recrear la BD.

## Decisiones confirmadas con el usuario

1. **Ubicación de `telefonoSecundario`:** en `User` (no en `Alumno`/`Profesor` por separado), porque un mismo `User` puede tener varios roles a lo largo del tiempo (ej. Alumno que después es Profesor) y el teléfono secundario es un dato de la persona, no del rol. Esto implica migrar `Profesor.telefonoContacto` → `User.telefonoSecundario`.
2. **Constraint de unicidad de `telefono`:** se elimina la validación `existsByTelefono` para altas con rol `ALUMNO` (varios alumnos de una familia pueden compartir teléfono del hogar). Se mantiene para `PROFESOR`/`ADMIN`/`ADMINISTRATIVO` (ahí el teléfono sigue siendo personal).
3. **Editable en edición:** sí — `telefonoSecundario` se puede modificar después de creado, tanto en Alumno como en Profesor (a diferencia del resto de los datos personales del Alumno, que son inmutables desde su pantalla).
4. **Migración de datos:** no aplica — proyecto en desarrollo, se recrea la BD (`ddl-auto: update` ya crea las columnas nuevas).
5. **Cambio de rol activo:** redirige a `/dashboard` (mismo comportamiento que `/seleccionar-rol` ya tiene hoy), para evitar quedar en una ruta que el nuevo rol no debería ver.

## Parte A — Backend: teléfono secundario unificado

### Modelo
- `User.java`: quitar `@UniqueConstraint(columnNames = "telefono")` de `@Table`. Agregar campo `telefonoSecundario` (String, nullable, sin constraint).
- `Profesor.java`: eliminar el campo `telefonoContacto` (y su columna asociada).

### Puerto de creación de usuarios
`UserLookupPort.crearConCredencialesPorDni(...)` (interfaz en `core`, impl en `security`) gana un parámetro `telefonoSecundario` (nullable):
```java
User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                  String telefono, String telefonoSecundario, Rol rol);
```
`UserLookupPortImpl`: salta la validación `existsByTelefono` cuando `rol == Rol.ALUMNO`; la mantiene para el resto. Setea `user.setTelefonoSecundario(telefonoSecundario)`.

### Profesor
- `ProfesorRegistroDTO`: `telefonoContacto` → pasa a leerse/escribirse como `telefonoSecundario` (mismo `@NotBlank`, sigue obligatorio para Profesor).
- `ProfesorUpdateRequest`: ídem, sigue `@NotBlank`.
- `ProfesorResponse`: expone `telefonoSecundario` en vez de `telefonoContacto` (nombre de campo actualizado; el frontend ajusta el nombre del campo en el payload, sin cambio visual en el form).
- `ProfesorServiceImpl`: `crearConUsuario`/`actualizar` leen/escriben `profesor.getUser().getTelefonoSecundario()` en vez de `profesor.getTelefonoContacto()`.

### Alumno
- `AlumnoRegistroDTO`: agrega `telefonoSecundario` (opcional, `@Pattern` solo si viene un valor no vacío).
- `AlumnoUpdateRequest`: agrega `telefonoSecundario` (opcional), además de `legajo`/`activo` que ya tenía.
- `AlumnoResponse`: agrega `telefonoSecundario`.
- `AlumnoServiceImpl.crearConUsuario()`: pasa `telefonoSecundario` a `userLookupPort.crearConCredencialesPorDni(...)`. `actualizar()`: además de legajo/activo, ahora también actualiza `user.setTelefonoSecundario(request.getTelefonoSecundario())`.

### Frontend
- `frontend/lib/services/profesores.service.ts`: campo `telefonoContacto` → `telefonoSecundario` en las interfaces (`CrearProfesorInput`, `ActualizarProfesorInput`, `Profesor`).
- `frontend/components/profesores/profesor-form-dialog.tsx`: el label sigue "Teléfono Secundario" (ya está desde la sesión anterior); cambia el nombre del campo interno del form/payload de `telefonoContacto` a `telefonoSecundario`.
- `frontend/lib/services/alumnos.service.ts`: `CrearAlumnoInput` y `ActualizarAlumnoInput` ganan `telefonoSecundario` opcional; `Alumno` (response) también.
- `frontend/components/alumnos/alumno-form-dialog.tsx`: nuevo campo opcional "Teléfono Secundario" en el bloque de creación Y en el bloque de edición (hoy el de edición solo tiene legajo/estado).

## Parte B — Selector de Perfil (Context Switcher)

### Hook `useAuth` (fuente única de verdad)
- `AuthUser` (`frontend/hooks/use-auth.tsx`) gana `roles?: string[]` (lista completa de roles del JWT, hoy solo vive en `localStorage.getItem("roles")` sin pasar por el contexto).
- `loadUserFromStorage()`: además de los campos actuales, hidrata `roles` parseando `localStorage.getItem("roles")`.
- Nueva función expuesta por el contexto: `switchRole(rol: string): void` — hace `localStorage.setItem("user-role", rol)` + `setUser({...user, role: rol})`. Centraliza la lógica que hoy vive duplicada e inline en `seleccionar-rol/page.tsx`.
- `seleccionar-rol/page.tsx`: `handleRoleSelect` pasa a llamar `switchRole(rol)` en vez de reconstruir el objeto `user` a mano; después sigue haciendo `router.push("/dashboard")` y `localStorage.removeItem("pending-roles")` (esto último es específico de la selección inicial, no del switcher del navbar, así que se queda en esta página).

### Navbar (`header.tsx`)
- Deja de leer `localStorage` en su propio `useEffect` (estado local `userData`) — pasa a consumir `useAuth()` directamente (`user`, `switchRole`).
- El badge de rol activo lee `user.role` del contexto.
- Si `user.roles` tiene más de un elemento: se agrega una sección "Cambiar rol" al `DropdownMenu` ya existente (mismo menú del avatar), listando cada rol de `user.roles` como `DropdownMenuItem`; al hacer clic, llama `switchRole(rol)` y luego `router.push("/dashboard")`.
- Si `user.roles` tiene 0 o 1 elemento: no se muestra esa sección (comportamiento actual intacto para el caso común de un solo rol).

### Sidebar (`sidebar.tsx`)
- Sin cambios de código — ya filtra `navigation` por `user?.role` leído del contexto (`useAuth()`), así que reacciona automáticamente en cuanto `switchRole` actualiza el estado global (React re-renderiza porque `user` es parte del contexto).

## Fuera de alcance

- `UserServiceImpl.register()` (endpoint genérico `/auth/register`) sigue validando `existsByTelefono` para cualquier rol, incluido ALUMNO — inconsistente con el alta de un paso (`POST /api/alumnos`), pero ese endpoint genérico no lo usa el frontend de Alumnos hoy. Se documenta como limitación conocida, no se toca.
- Migración de datos existentes de `Profesor.telefonoContacto` — no aplica, se recrea la BD en desarrollo.
- Un usuario con roles ADMIN/ADMINISTRATIVO NO puede tener también ALUMNO/PROFESOR gestionado desde la pantalla de administradores (ver limitación ya documentada en el spec de "Gestión de Administradores" — `actualizar()` ahí ya preserva roles no gestionables desde la sesión anterior).
- No se agrega ningún guard de página por rol — sigue sin existir en todo el frontend, consistente con el resto del sistema.
