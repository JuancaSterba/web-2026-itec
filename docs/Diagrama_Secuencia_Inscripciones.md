# Diagramas de Secuencia: Inscripciones

A continuación se presentan los flujos de inscripción, tanto para una Carrera como para una Materia. Según las reglas de negocio, actualmente el sistema es operado por el **Administrativo** (el alumno no autogestiona sus inscripciones en esta fase).

---

## 1. Inscripción de Alumno a una Carrera

Este proceso vincula al alumno con el plan de estudios general. 

```mermaid
sequenceDiagram
    autonumber
    actor Administrativo
    participant Frontend as Frontend (Cliente)
    participant Core as App Principal (Core)
    participant DB as Base de Datos

    Administrativo->>Frontend: Selecciona Alumno y Carrera a inscribir
    Frontend->>Core: POST /api/v1/inscripciones/carreras (alumnoId, carreraId)
    
    activate Core
    Core->>Core: Valida Token JWT y Rol ADM
    
    %% Validaciones previas
    Core->>DB: Consulta si el Alumno existe y está ACTIVO
    DB-->>Core: OK (Alumno Activo)
    
    Core->>DB: Consulta si ya existe inscripción a la misma Carrera
    DB-->>Core: Null (No inscripto previamente)
    
    %% Guardado
    Core->>DB: Guarda registro en ALUMNOS_CARRERAS (INSERT)
    activate DB
    DB-->>Core: OK (Inscripción creada)
    deactivate DB
    
    Core-->>Frontend: HTTP 201 Created (Inscripción Exitosa)
    deactivate Core
    
    Frontend-->>Administrativo: Muestra mensaje "Alumno inscripto a la carrera"
```

---

## 2. Inscripción de Alumno a una Materia (Comisión)

Una vez que el alumno pertenece a una carrera, el Administrativo lo inscribe a las materias (específicamente a una comisión) en el cuatrimestre correspondiente. Aquí es donde **el sistema debe validar las correlativas**.

```mermaid
sequenceDiagram
    autonumber
    actor Administrativo
    participant Frontend as Frontend (Cliente)
    participant Core as App Principal (Core)
    participant DB as Base de Datos

    Administrativo->>Frontend: Selecciona Alumno y Comisión de la Materia
    Frontend->>Core: POST /api/v1/inscripciones/materias (alumnoId, comisionId)
    
    activate Core
    Core->>Core: Valida Token JWT y Rol ADM
    
    %% Validación de pertenencia a carrera
    Core->>DB: Consulta si Alumno pertenece a la Carrera de esa Materia
    DB-->>Core: OK (Pertenece a la carrera)
    
    %% Validación de Correlatividades
    Core->>DB: Consulta materias correlativas exigidas por esta Materia
    activate DB
    DB-->>Core: Retorna lista de Materias Correlativas
    deactivate DB
    
    alt Tiene Correlativas
        Core->>DB: Consulta el EstadoCursada del Alumno en esas correlativas
        activate DB
        DB-->>Core: Retorna estados (Regular / Aprobado)
        deactivate DB
        
        Core->>Core: Verifica si cumple con la aprobación/regularidad exigida
    end
    
    alt No cumple correlativas
        Core-->>Frontend: HTTP 409 Conflict ("Faltan correlativas")
        Frontend-->>Administrativo: Muestra error (Falta aprobar Materia X)
    else Cumple requisitos (o no tiene correlativas)
        Core->>DB: Guarda registro en ALUMNOS_INSCRIPTOS con estado 'Inscripto'
        activate DB
        DB-->>Core: OK (Registro guardado)
        deactivate DB
        
        Core-->>Frontend: HTTP 201 Created (Inscripción Exitosa)
        Frontend-->>Administrativo: Muestra mensaje "Alumno inscripto a la comisión"
    end
    
    deactivate Core
```

### 💡 Puntos Claves de este Flujo:
* **El Actor siempre es el Administrativo**: Se asegura que solo un rol con permisos pueda alterar el plan y las cursadas de un estudiante.
* **Separación de Inscripciones**: Inscribirse a una carrera es independiente de inscribirse a cursar una materia. Primero debe existir la inscripción a la carrera (tabla `alumnos_carreras`).
* **Regla de Correlativas (Paso 9 y 10 del segundo diagrama)**: Es el punto más crítico. Antes de hacer el `INSERT` en `alumnos_inscriptos`, el backend debe buscar en el historial del alumno si las materias pre-requisito fueron cursadas y si su estado académico es válido (usualmente se exige estar "Aprobado" o "Regular" dependiendo el plan de estudios).
