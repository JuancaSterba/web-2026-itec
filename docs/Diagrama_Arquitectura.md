# Diagrama de Arquitectura

> Reescrito 2026-07-08. Reemplaza la versión anterior (2026-06-13), genérica y sin API Gateway. Consolida `docs/arquitectura/diagrama_ecosistema.md`, corrigiendo dos errores contra el `application.yml` real del Gateway: la ruta de `ms-notas` es `/api/calificaciones-parciales/**` (no `/api/notas/*`), y el flujo de JWT offloading (sección 2) describe el diseño, pero **`ms-notas`/`ms-asistencias` no leen `X-User-Roles`** — ver `.remember/PENDIENTES.md` ítem 7.

El proyecto está construido bajo una arquitectura de microservicios: cada dominio transaccional está aislado y orquestado a través de un API Gateway (Spring Cloud Gateway).

## 1. Diagrama de Servicios

```mermaid
graph TD
    Client[Cliente: Frontend Next.js] -->|HTTP:8080| Gateway[API Gateway<br/>Spring Cloud Gateway]

    subgraph "Ecosistema Docker"
        Gateway -->|/api/core/**<br/>:8081| Core[Backend Core<br/>Gestión Maestra y Seguridad]
        Gateway -->|/api/asistencias/**<br/>:8083| Asistencias[MS Asistencias<br/>Presentismo]
        Gateway -->|/api/calificaciones-parciales/**<br/>:8084| Notas[MS Calificaciones<br/>Notas Parciales]

        Core -->|JDBC| DBCore[(MySQL: backoffice_itec)]
        Asistencias -->|JDBC| DBAsistencias[(MySQL: db_asistencias)]
        Notas -->|JDBC| DBNotas[(MySQL: db_calificaciones)]
    end

    subgraph "Librerías Maven compartidas (JARs, no dockerizadas aparte)"
        Commons[Módulo Commons<br/>DTOs, Utilidades]
        Security[Módulo Security<br/>JWT, Filtros]
    end

    Core -.->|Dependencia Maven| Commons
    Core -.->|Dependencia Maven| Security

    classDef gateway fill:#f9f,stroke:#333,stroke-width:2px;
    classDef core fill:#bbf,stroke:#333,stroke-width:1px;
    classDef ms fill:#bfb,stroke:#333,stroke-width:1px;
    classDef db fill:#fbb,stroke:#333,stroke-width:1px;

    class Gateway gateway;
    class Core core;
    class Asistencias,Notas ms;
    class DBCore,DBAsistencias,DBNotas db;
```

**Nota sobre aislamiento:** `ms-asistencias` y `ms-calificaciones` no dependen del módulo `security` (no tienen Spring Security propio) — confían en que el Gateway ya validó el JWT antes de proxear la request (ver sección 2). No importan JARs `commons`/`security` como sí hace `Core`.

## 2. Flujo de Seguridad (JWT en el Gateway)

El Gateway es el único punto de entrada expuesto. El filtro `JwtAuth` (aplicado a las rutas `core-api`, `asistencias-api`, `notas-api`) valida el JWT con la misma clave simétrica del Core; si falta o es inválido, responde `401` **antes** de llegar al microservicio (confirmado con `curl` sin token → 401 en ambos). Si es válido, inyecta los claims como headers (`X-User-Id`, `X-User-Roles`, `X-User-Email`).

**Estado real:** el Core sí usa esos headers/su propio JWT vía Spring Security (`@PreAuthorize` por rol en cada controller). `ms-notas` y `ms-asistencias` **no leen `X-User-Roles`** — cualquier usuario autenticado, de cualquier rol, puede operar sobre esos dos endpoints; solo se exige que el token exista y sea válido, no que el rol sea el correcto. Harden pendiente, ver `.remember/PENDIENTES.md` ítem 7.

```mermaid
sequenceDiagram
    participant Cliente
    participant Gateway as API Gateway
    participant Core as Backend Core
    participant MS as MS Asistencias / Notas

    rect rgb(230, 240, 255)
    Note over Cliente,Core: 1. Autenticación (ruta pública, sin filtro JwtAuth)
    Cliente->>Gateway: POST /api/core/auth/login (user/pass)
    Gateway-->>Core: Rewrite a /auth/login
    Core-->>Gateway: 200 OK + JWT
    Gateway-->>Cliente: 200 OK + JWT
    end

    rect rgb(230, 255, 230)
    Note over Cliente,MS: 2. Petición a microservicio privado
    Cliente->>Gateway: POST /api/asistencias (Bearer JWT)

    alt Token inválido o ausente
        Gateway-->>Cliente: 401 Unauthorized
    else Token válido
        Gateway->>Gateway: Valida firma y extrae claims
        Gateway->>MS: POST /api/asistencias (Headers: X-User-Id, X-User-Roles)
        MS-->>MS: Ejecuta la lógica sin chequear X-User-Roles (gap conocido)
        MS-->>Gateway: 201 Created
        Gateway-->>Cliente: 201 Created
    end
    end
```

## 3. Diccionario de Servicios

- **Backend Core:** dueño de los datos estructurales (Alumnos, Profesores, Carreras, Planes, Materias, Comisiones, Cursadas, Inscripciones, Usuarios). Expone login y emisión de JWT. Único servicio con `@PreAuthorize` por rol.
- **MS Asistencias:** conoce solo `cursadaId + fecha + estado` para registrar presentismo.
- **MS Calificaciones (ms-notas):** conoce solo `cursadaId + instancia + nota + fecha` para registrar calificaciones parciales.
- **API Gateway:** enrutador de tráfico y validador de JWT (autenticación). Puerto `8080`. No hace autorización por rol para las rutas de `ms-asistencias`/`ms-notas` — solo `core-api`.
