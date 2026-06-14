# Diagrama de Arquitectura

El siguiente diagrama representa la arquitectura general del sistema, tanto a nivel de componentes (módulos Maven) como a nivel de despliegue (contenedores Docker), basándonos en los requerimientos definidos.

```mermaid
graph TD
    %% Contenedores de Frontend y Base de Datos
    subgraph "Docker: Frontend"
        UI[Aplicación Cliente <br> React / Angular / Vue]
    end

    subgraph "Docker: Base de Datos"
        DB[(Base de Datos <br> MySQL / PostgreSQL)]
    end

    %% Red interna del Backend
    subgraph "Docker: Backend Network (API REST)"
        Core[Contenedor 3 <br> App Principal / Core]
        MS_Asistencias[Contenedor 4 <br> Microservicio Asistencias]
        MS_Calificaciones[Contenedor 5 <br> Microservicio Calificaciones]
    end

    %% Librerías compartidas (No dockerizadas independientemente)
    subgraph "Librerías Maven (JARs)"
        Commons[Módulo Commons <br> DTOs, Utilidades]
        Security[Módulo Security <br> JWT, Filtros]
    end

    %% Conexiones Cliente -> Backend
    UI -->|Peticiones HTTP / REST| Core
    UI -->|Peticiones HTTP / REST| MS_Asistencias
    UI -->|Peticiones HTTP / REST| MS_Calificaciones

    %% Conexiones Backend -> Base de Datos
    Core -->|Lectura / Escritura| DB
    MS_Asistencias -->|Lectura / Escritura| DB
    MS_Calificaciones -->|Lectura / Escritura| DB

    %% Inyección de dependencias Maven
    Core -.->|Dependencia Maven| Commons
    Core -.->|Dependencia Maven| Security
    
    MS_Asistencias -.->|Dependencia Maven| Commons
    MS_Asistencias -.->|Dependencia Maven| Security
    
    MS_Calificaciones -.->|Dependencia Maven| Commons
    MS_Calificaciones -.->|Dependencia Maven| Security
```

### Notas sobre la Arquitectura:
- **Orquestación:** Todos los contenedores se comunican a través de una misma red definida en el `docker-compose.yml`.
- **Desacoplamiento:** Las asistencias y calificaciones funcionan como microservicios separados de la App Principal para mayor escalabilidad.
- **Seguridad y Comunes:** Se emplean módulos compartidos (`commons` y `security`) que se inyectan en tiempo de compilación a los 3 contenedores backend.
