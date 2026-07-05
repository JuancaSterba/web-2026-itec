# Gestión de Administradores — Design Spec

**Fecha:** 2026-07-04
**Origen:** `.remember/PENDIENTES.md` → "Gestión de Administradores" (última tarea pendiente de Prioridad 1)
**Rama:** `feature/gestion-administradores`

## Contexto

No existe pantalla ni endpoints para crear/listar/editar usuarios con rol `ADMIN` o `ADMINISTRATIVO` de forma directa. Hoy esos roles solo se crean indirectamente (seed inicial / scripts), a diferencia de Alumno y Profesor que ya tienen su flujo de alta con usuario auto-generado.

Infraestructura existente relevante:
- `User` entity: `backend/commons/src/main/java/ar/edu/itec1misiones/model/User.java` — implementa `UserDetails`, campos `id, username, password, nombre, apellido, dni, email, telefono, roles (Set<Rol>), enabled`. Constraints unique en username/dni/email/telefono.
- `Rol` enum: `backend/commons/.../model/Rol.java` → `ADMIN, ADMINISTRATIVO, PROFESOR, ALUMNO`.
- `UserRepository`: `backend/security/.../repository/UserRepository.java` — solo `findByUsername`, `existsBy*`. Sin `findAll`/filtro por rol.
- `UserController` (`/auth/register`): `backend/security/.../controller/UserController.java` — único punto de alta directa, sin listar/editar.
- `BCryptPasswordEncoder`: bean en `backend/security/.../config/SecurityConfig.java`, usado en `UserServiceImpl.register()`.
- `ApiResponse<T>` + `MetaBuilderHelper`: patrón estándar en `backend/commons/.../dto/`, replicado en todos los controllers (ver `ProfesorController`).
- Gateway: `Path=/api/core/**` → rewrite `/api/${segment}` hacia el app `core` (mismo deployable que `security`/`commons`, módulos Maven separados). No hace falta tocar `api-gateway`.
- Frontend: patrón CRUD clonable en `frontend/lib/services/profesores.service.ts` + `frontend/components/profesores/*` + `frontend/app/dashboard/profesores/page.tsx`.
- `sidebar.tsx`: filtra ítems de menú por `user.role`, sin guard real de página (la protección efectiva es `@PreAuthorize` en backend).

## Decisiones (confirmadas con el usuario)

1. **Alcance CRUD:** Crear + Listar + Editar + Deshabilitar (soft, vía `User.enabled`). Sin DELETE físico.
2. **Password:** auto-generada = DNI, BCrypt, mismo patrón que Alumno/Profesor (sin campo de password en el form).
3. **Acceso a la pantalla:** solo rol `ADMIN`.
4. **Filtro de listado:** solo usuarios con rol `ADMIN` o `ADMINISTRATIVO` (no mezcla con Alumno/Profesor).
5. **Campos editables:** rol (ADMIN ↔ ADMINISTRATIVO), datos de contacto (nombre, email, teléfono), estado (activo/deshabilitado), reset de password.
6. **Auto-bloqueo:** un ADMIN no puede deshabilitarse ni cambiar su propio rol desde esta pantalla (backend rechaza 400; frontend deshabilita esos controles preventivamente en la fila propia).

## Backend

### Módulo y ubicación
Nuevo código en módulo `security` (dueño de `User`/`UserRepository`), no en `core` — evita crear un `UserLookupPort` extra ya que acá se opera sobre `User` directamente, sin entidad de dominio intermedia (a diferencia de Alumno/Profesor).

### Endpoints — `AdminUsuarioController`, base path `/api/administradores`
Todos protegidos con `@PreAuthorize("hasRole('ADMIN')")`. Responses: `ApiResponse<UsuarioAdminResponse>` (nunca expone `password`).

| Método | Path | Body | Descripción |
|---|---|---|---|
| GET | `/api/administradores` | — (query opcional `search`) | Lista usuarios con rol ADMIN o ADMINISTRATIVO |
| POST | `/api/administradores` | `CrearAdministradorRequest` | Alta: username/password = DNI |
| PUT | `/api/administradores/{id}` | `ActualizarAdministradorRequest` | Edita datos de contacto, rol, enabled |
| POST | `/api/administradores/{id}/reset-password` | — | Resetea password a DNI (BCrypt) |

### DTOs nuevos (módulo `security` o `commons` si se reutilizan)
- `CrearAdministradorRequest`: `nombre, apellido, dni, email, telefono, rol` (rol: solo ADMIN|ADMINISTRATIVO, validado con `@Pattern`/enum custom).
- `ActualizarAdministradorRequest`: `nombre, apellido, email, telefono, rol, enabled`.
- `UsuarioAdminResponse`: `id, username, nombre, apellido, dni, email, telefono, rol, enabled` (rol expuesto como string único, no el Set completo — un admin de este módulo tiene un solo rol relevante).

### Repositorio
`UserRepository` gana:
```java
@Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r IN :roles")
List<User> findByRolesIn(@Param("roles") Collection<Rol> roles);
```

### Servicio — `UserAdminService`
- `listar(String search)` → filtra por roles ADMIN/ADMINISTRATIVO, aplica `search` opcional sobre nombre/apellido/dni si viene.
- `crear(CrearAdministradorRequest)` → valida DNI único (reusa `existsByDni`), arma `User` con roles = `{rol}`, username=dni, password=BCrypt(dni), `enabled=true`.
- `actualizar(Long id, ActualizarAdministradorRequest, Long usuarioAutenticadoId)` → si `id == usuarioAutenticadoId` y (`enabled == false` o `rol` distinto al actual) → throw `IllegalArgumentException`/excepción custom capturada por `SecurityExceptionHandler` → 400.
- `resetPassword(Long id)` → `password = BCrypt(user.getDni())`.

`usuarioAutenticadoId` se obtiene del header `X-User-Id` inyectado por el gateway (mismo mecanismo que ya usan los `@PreAuthorize` de otros controllers).

### Validación y errores
- DNI regex `^\d{7,8}$`, duplicado → 409 vía `SecurityExceptionHandler` (patrón existente).
- Email regex simple.
- Teléfono obligatorio en alta (un solo campo, a diferencia de Profesor que ahora tiene 2).
- Rol: solo ADMIN|ADMINISTRATIVO aceptados por el DTO (rechazo si viene PROFESOR/ALUMNO).
- Auto-bloqueo → 400 con mensaje `"No podés deshabilitarte o cambiar tu propio rol"`.

## Frontend

### Archivos nuevos
- `frontend/lib/services/administradores.service.ts`
  - Interface `Administrador { id, username, nombre, apellido, dni, email, telefono, rol, enabled }`
  - `listarAdministradores(search?)`, `crearAdministrador(payload)`, `actualizarAdministrador(id, payload)`, `resetPasswordAdministrador(id)` sobre `apiClient`, base `/api/core/administradores`.
- `frontend/components/administradores/administrador-form-dialog.tsx`
  - Alta: nombre, apellido, dni, email, teléfono, select rol (ADMIN/ADMINISTRATIVO). Mismo patrón de validación manual (regex) que `profesor-form-dialog.tsx`, sin Zod/Yup (no se usa en el proyecto).
  - Edición: nombre, apellido, email, teléfono, select rol, toggle activo/inactivo (igual UI que Profesor). Deshabilita rol/estado si `profesor.id === user.id`.
  - Botón "Resetear contraseña" con confirmación (`AlertDialog`, patrón de `eliminar-profesor-dialog.tsx`).
- `frontend/app/dashboard/administradores/page.tsx`
  - Tabla: nombre, DNI, email, rol, estado. Búsqueda, loading/empty states, botón "Nuevo administrador", acciones editar/resetear (patrón `dashboard/profesores/page.tsx`).

### Archivos modificados
- `frontend/components/layout/sidebar.tsx` — nuevo ítem `{ name: "Administradores", href: "/dashboard/administradores", icon: ShieldCheck (o similar), roles: ["ADMIN"] }`.

## Fuera de alcance
- DELETE físico de usuarios.
- Gestión de PROFESOR/ALUMNO desde esta pantalla (ya tienen las suyas).
- Guard de página por rol en frontend (no existe hoy para ningún módulo; la protección real es backend `@PreAuthorize`, consistente con el resto del sistema).
- Password manual en el formulario (se decidió auto-generar = DNI).
