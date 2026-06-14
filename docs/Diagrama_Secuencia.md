# Diagrama de Secuencia: Alta de Alumno

Este diagrama ilustra el flujo de comunicación entre los componentes del sistema para el caso de uso de "Crear Alumno" (US-ALU-01), abarcando desde la interacción del usuario en el frontend hasta la validación y guardado en la base de datos por parte del backend.

```mermaid
sequenceDiagram
    autonumber
    actor Administrativo
    participant Frontend as Frontend (Cliente)
    participant Backend as Backend (App Principal)
    participant DB as Base de Datos

    Administrativo->>Frontend: Completa formulario Alta Alumno (Datos)
    Frontend->>Backend: POST /api/v1/alumnos (Datos Alumno)
    
    activate Backend
    Backend->>Backend: Valida Token JWT y Permisos de ADM
    Backend->>DB: Consulta si existe el DNI (SELECT)
    
    activate DB
    alt DNI ya existe
        DB-->>Backend: Retorna registro existente
        Backend-->>Frontend: HTTP 409 Conflict ("DNI ya registrado")
        Frontend-->>Administrativo: Muestra mensaje de error (DNI duplicado)
    else DNI válido y no existe
        DB-->>Backend: No se encuentran coincidencias
        Backend->>Backend: Valida formato de Email y Teléfono
        Backend->>DB: Guarda el nuevo Alumno (INSERT)
        DB-->>Backend: Confirmación de registro
        Backend-->>Frontend: HTTP 201 Created (Alumno creado con Estado ACTIVO)
        Frontend-->>Administrativo: Muestra mensaje de éxito
    end
    deactivate DB
    deactivate Backend
```
