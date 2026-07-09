# Diagrama de Clases (Conceptual)

> Reescrito 2026-07-08. La versión anterior (2026-06-13) modelaba el proyecto base: `ComisionMateria`, `Cuatrimestre`, `AlumnoCarrera`, `AlumnoInscripto`, `EstadoCursada` (como entidad), `Examen`, `Nota`, `TipoEvaluacion` — ninguna de estas clases existe hoy. Reescrito contra las entidades JPA reales (`backend/core/.../model/`, `backend/security/.../model/User.java`).

```mermaid
classDiagram
    %% GESTIÓN DE ACCESO (backend/security)
    class User {
        +Long id
        +String username
        +String password
        +String nombre
        +String apellido
        +String dni
        +String email
        +String telefono
        +String telefonoSecundario
        +String legajo
        +boolean enabled
        +Set~Rol~ roles
    }
    class Rol {
        <<enumeration>>
        ADMIN
        ADMINISTRATIVO
        PROFESOR
        ALUMNO
    }
    User "1" --> "*" Rol : roles

    %% ACTORES (backend/core) — "roles académicos" sobre un User
    class Alumno {
        +Long id
        +boolean activo
    }
    class Profesor {
        +Long id
        +String titulo
        +boolean activo
    }
    User "1" --o "0..1" Alumno : es
    User "1" --o "0..1" Profesor : es

    %% ESTRUCTURA ACADÉMICA
    class Carrera {
        +Long id
        +String nombre
        +String resolucionMinisterial
        +boolean activa
    }
    class PlanEstudio {
        +Long id
        +String cohorte
        +String resolucion
        +LocalDate fechaImplementacion
        +boolean activo
    }
    Carrera "1" *-- "*" PlanEstudio : tiene

    class Materia {
        +Long id
        +String nombre
        +String codigoInterno
        +String descripcion
        +boolean activa
    }
    class MateriaPlan {
        +Long id
        +Integer cuatrimestreDictado
        +Integer cargaHoraria
    }
    PlanEstudio "1" *-- "*" MateriaPlan : define
    Materia "1" --> "*" MateriaPlan : instanciada_en
    MateriaPlan "*" --> "*" MateriaPlan : correlativas

    class CicloLectivo {
        +Long id
        +Integer anio
        +LocalDate fechaInicio
        +LocalDate fechaFin
        +boolean activo
    }
    class PeriodoAcademico {
        +Long id
        +String nombre
        +LocalDate fechaInicio
        +LocalDate fechaFin
    }
    CicloLectivo "1" *-- "*" PeriodoAcademico : subdividido_en

    class Comision {
        +Long id
        +String nombreComision
        +Integer cupoMaximo
        +boolean activa
    }
    PeriodoAcademico "1" --> "*" Comision : oferta
    MateriaPlan "1" --> "*" Comision : dictado_fisico_de

    class ComisionProfesor {
        +Long id
        +String rol
    }
    Comision "1" *-- "*" ComisionProfesor : dictada_por
    Profesor "1" --> "*" ComisionProfesor : asignado_a

    %% HORARIOS (huérfano — sin UI todavía, ver PENDIENTES.md ítem 9)
    class HorarioClase {
        +Long id
        +DayOfWeek diaSemana
    }
    class ModuloHorario {
        +Long id
        +int numero
        +LocalTime horaInicio
        +LocalTime horaFin
    }
    Comision "1" *-- "*" HorarioClase : ocurre_en
    HorarioClase "*" --> "*" ModuloHorario : modulos

    %% INSCRIPCIONES Y CURSADAS
    class InscripcionCarrera {
        +Long id
        +LocalDate fechaInscripcion
        +String estado
    }
    Alumno "1" --> "*" InscripcionCarrera : se_inscribe
    PlanEstudio "1" --> "*" InscripcionCarrera : en

    class Cursada {
        +Long id
        +LocalDate fechaInscripcion
        +String condicionFinal
        +Double notaCierre
    }
    Alumno "1" --> "*" Cursada : cursa
    Comision "1" --> "*" Cursada : cursada_por

    %% MICROSERVICIOS — vinculados solo por Cursada.id (cursadaId), sin FK real
    class Asistencia {
        <<ms-asistencias>>
        +Long id
        +Long cursadaId
        +LocalDate fecha
        +String estado
    }
    class CalificacionParcial {
        <<ms-notas>>
        +Long id
        +Long cursadaId
        +String instancia
        +Double nota
        +LocalDate fecha
    }
    Cursada ..> Asistencia : cursadaId
    Cursada ..> CalificacionParcial : cursadaId
```

### Notas

- `EstadoCursada` (enum `REGULAR`/`APROBADO`/`RECURSA`) existe en el código (`model/EstadoCursada.java`) pero está **sin usar** — `Cursada.condicionFinal` es un `String` libre, no tipado contra ese enum. No se incluye en el diagrama por ese motivo.
- `HorarioClase`/`ModuloHorario` existen en el backend pero no tienen ningún frontend que los consuma (ver `.remember/PENDIENTES.md` ítem 9).
- `Asistencia` y `CalificacionParcial` viven en bases de datos separadas (`db_asistencias`, `db_calificaciones`) — la relación con `Cursada` es solo por convención de `cursadaId`, no una FK real de base de datos.
