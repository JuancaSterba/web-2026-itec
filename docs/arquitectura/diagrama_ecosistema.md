# Arquitectura del Sistema - Ecosistema de Microservicios

El proyecto ITEC Web 2026 está construido bajo una arquitectura moderna de microservicios, donde cada dominio transaccional está aislado y orquestado a través de un API Gateway.

## 1. Diagrama de Arquitectura de Servicios

El siguiente diagrama ilustra cómo fluyen las peticiones desde el cliente (Frontend/Postman) a través del Gateway hacia los diferentes microservicios, y cómo cada uno se conecta a su propia base de datos lógica para garantizar el aislamiento (evitando dependencias fuertes).

```mermaid
graph TD
    Client[Cliente: Frontend Next.js / Swagger] -->|HTTP:8080| Gateway[API Gateway\nSpring Cloud Gateway]
    
    subgraph Ecosistema Docker
        Gateway -->|/api/core/*\n:8081| Core[Backend Core\nGestión Maestra y Seguridad]
        Gateway -->|/api/asistencias/*\n:8083| Asistencias[MS Asistencias\nPresentismo]
        Gateway -->|/api/notas/*\n:8084| Notas[MS Calificaciones\nExámenes y Notas]
        
        Core -->|JDBC| DBCore[(MySQL: backoffice_itec)]
        Asistencias -->|JDBC| DBAsistencias[(MySQL: db_asistencias)]
        Notas -->|JDBC| DBNotas[(MySQL: db_calificaciones)]
    end
    
    classDef gateway fill:#f9f,stroke:#333,stroke-width:2px;
    classDef core fill:#bbf,stroke:#333,stroke-width:1px;
    classDef ms fill:#bfb,stroke:#333,stroke-width:1px;
    classDef db fill:#fbb,stroke:#333,stroke-width:1px;
    
    class Gateway gateway;
    class Core core;
    class Asistencias,Notas ms;
    class DBCore,DBAsistencias,DBNotas db;
```

## 2. Flujo de Seguridad (JWT Offloading)

Para evitar replicar la lógica de Spring Security en cada microservicio, el sistema implementa un patrón de **API Gateway Token Offloading**. 

El Gateway es el único punto de entrada expuesto. Cuando recibe una petición hacia una ruta protegida, intercepta el token JWT, lo valida usando la misma llave simétrica (secret key) del Core, y si es válido, extrae la identidad del usuario y la inyecta como Headers HTTP (`X-User-Id`, `X-User-Roles`) para que los microservicios internos sepan quién está ejecutando la acción sin tener que revalidar el token.

```mermaid
sequenceDiagram
    participant Cliente
    participant Gateway as API Gateway
    participant Core as Backend Core
    participant MS as MS Asistencias / Notas
    
    %% Flujo de Login
    rect rgb(230, 240, 255)
    Note over Cliente,Core: 1. Flujo de Autenticación Pública
    Cliente->>Gateway: POST /auth/login (user/pass)
    Gateway-->>Core: Rutea directo (ruta ignorada por filtro JWT)
    Core-->>Gateway: 200 OK + JWT Token
    Gateway-->>Cliente: 200 OK + JWT Token
    end
    
    %% Flujo Transaccional
    rect rgb(230, 255, 230)
    Note over Cliente,MS: 2. Petición a Microservicio Privado
    Cliente->>Gateway: POST /api/asistencias (Header: Bearer {JWT})
    
    alt Token Inválido o Ausente
        Gateway-->>Cliente: 401 Unauthorized (Bloqueado)
    else Token Válido
        Gateway->>Gateway: Valida Firma y extrae Claims
        Gateway->>MS: POST /api/asistencias (Headers: X-User-Id, X-User-Roles)
        MS-->>MS: Ejecuta lógica confiando en Headers
        MS-->>Gateway: 201 Created
        Gateway-->>Cliente: 201 Created
    end
    end
```

## 3. Diccionario de Servicios

- **Backend Core:** Dueño de los datos estructurales del sistema (Alumnos, Profesores, Materias, Carreras, Inscripciones, Usuarios). Expone el inicio de sesión y la generación de JWT.
- **MS Asistencias:** Microservicio liviano. Solo conoce IDs del alumno y de la comisión (provistos por el core) para registrar el presentismo.
- **MS Calificaciones:** Microservicio liviano para gestionar evaluaciones, parciales y notas de un alumno en una comisión específica.
- **API Gateway:** Enrutador de tráfico y validador central de seguridad. Expuesto en el puerto `8080`.
