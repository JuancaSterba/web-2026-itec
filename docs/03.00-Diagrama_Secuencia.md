# Diagrama de Secuencia: Alta de Alumno / Profesor

> Reescrito 2026-07-08. La versión anterior (2026-06-13, `POST /api/v1/alumnos`) era del proyecto base: no reflejaba el Gateway, ni la separación `Usuario`/`Alumno`, ni la convención `username=DNI`. Consolida `docs/arquitectura/flujo_creacion_actores.md`.

Ilustra el caso de uso "Crear Alumno" (US-ALU-01): la creación de un `Alumno`/`Profesor` genera automáticamente su `Usuario` subyacente, con credenciales derivadas del DNI — el administrativo llena un único formulario, sin pasos manuales de "crear usuario y después vincular".

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador/a (UI)
    participant Gateway as API Gateway
    participant Controller as Alumno/Profesor Controller
    participant Service as Alumno/Profesor Service
    participant UserRepo as Usuario Repository
    participant ActorRepo as Alumno/Profesor Repository

    Admin->>Gateway: POST /api/core/alumnos<br/>{nombre, apellido, dni, email, telefono}
    Gateway->>Gateway: Valida JWT, inyecta X-User-Id/X-User-Roles
    Gateway->>Controller: Rutea (rewrite /api/core/** -> /api/**)
    Controller->>Service: crearConUsuario(dto)

    rect rgb(240, 248, 255)
    Note over Service,UserRepo: 1. Identidad (UserLookupPortImpl)
    alt DNI ya existe (otro rol sobre la misma persona)
        Service->>UserRepo: adjuntarRol(usuarioExistente, ALUMNO)
    else DNI nuevo
        Service->>Service: username = DNI, password = BCrypt(DNI)
        Service->>Service: legajo = "AAAA-DNI"
        Service->>Service: enabled = false (ALUMNO/PROFESOR nacen deshabilitados;<br/>solo ADMIN/ADMINISTRATIVO nacen enabled=true)
        Service->>UserRepo: save(Usuario)
        UserRepo-->>Service: Usuario (id nuevo)
    end
    end

    rect rgb(230, 255, 230)
    Note over Service,ActorRepo: 2. Creación del Actor
    Service->>ActorRepo: save(Alumno vinculado al Usuario)
    ActorRepo-->>Service: Alumno
    end

    Service-->>Controller: AlumnoResponse
    Controller-->>Gateway: 201 Created
    Gateway-->>Admin: 201 Created + AlumnoResponse
```

### Reglas clave

- **Transacción atómica:** `crearConUsuario` es `@Transactional` — si falla la creación del Alumno, se revierte también el Usuario (no queda un Usuario huérfano).
- **DNI duplicado entre roles:** si el DNI ya existe (ej. la persona ya es Profesor y ahora se la da de alta como Alumno también), no se duplica el Usuario — se le adjunta el rol nuevo al existente. Si el rol ya estaba asignado, `409 ROL_YA_ASIGNADO`.
- **Cuentas deshabilitadas por defecto:** `ALUMNO`/`PROFESOR` se crean con `enabled=false` (`UserLookupPortImpl.crearConCredencialesPorDni`) — hoy no existe ningún endpoint para habilitarlas después del alta (gap detectado 2026-07-08 al crear un profesor de prueba; solo se pudo habilitar editando la base directamente). `ADMIN`/`ADMINISTRATIVO` nacen `enabled=true`.
