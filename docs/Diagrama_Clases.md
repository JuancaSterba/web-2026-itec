# Diagrama de Clases (Conceptual)

A continuación se presenta el diagrama de clases modelado a partir de las entidades actuales del backend. Este diagrama refleja la estructura de la gestión académica del ITEC N°1.

```mermaid
classDiagram
    %% GESTIÓN DE ACCESO
    class User {
        +Long id
        +String username
        +String password
        +boolean active
    }
    class Rol {
        +Long id
        +String nombre
    }
    User "*" --> "1" Rol : tiene

    %% ACTORES
    class Alumno {
        +Long id
        +String nombre
        +String apellido
        +String dni
        +String email
        +String telefono
    }
    class Profesor {
        +Long id
        +String nombre
        +String apellido
        +String dni
        +String email
    }
    
    %% ESTRUCTURA ACADÉMICA
    class Carrera {
        +Long id
        +String nombre
    }
    class PlanEstudio {
        +Long id
        +String resolucion
        +Date fechaImplementacion
    }
    Carrera "1" *-- "*" PlanEstudio : posee
    
    class Materia {
        +Long id
        +String nombre
    }
    PlanEstudio "1" *-- "*" Materia : contiene
    Materia "*" --> "*" Materia : correlativas (A confirmar)
    
    class Cuatrimestre {
        +Long id
        +String denominacion
        +Date fechaInicio
        +Date fechaFin
    }
    class ComisionMateria {
        +Long id
        +String codigoComision
    }
    ComisionMateria "*" --> "1" Materia : dicta
    ComisionMateria "*" --> "1" Cuatrimestre : corresponde a
    ComisionMateria "*" --> "1" Profesor : asignado a
    
    %% HORARIOS Y ASISTENCIAS
    class HorarioClase {
        +Long id
        +String diaSemana
    }
    class ModuloHorario {
        +Long id
        +Time horaInicio
        +Time horaFin
    }
    HorarioClase "*" --> "1" ModuloHorario : rango de
    ComisionMateria "1" *-- "*" HorarioClase : ocurre en
    
    %% INSCRIPCIONES
    class AlumnoCarrera {
        +Long id
        +Date fechaInscripcion
    }
    AlumnoCarrera "*" --> "1" Alumno : pertenece a
    AlumnoCarrera "*" --> "1" Carrera : en
    
    class AlumnoInscripto {
        +Long id
        +Date fechaInscripcion
    }
    class EstadoCursada {
        +Long id
        +String nombreEstado
    }
    AlumnoInscripto "*" --> "1" Alumno : pertenece a
    AlumnoInscripto "*" --> "1" ComisionMateria : cursa en
    AlumnoInscripto "*" --> "1" EstadoCursada : estado (Regular/Libre)
    
    class Asistencia {
        +Long id
        +Date fecha
        +boolean presente
    }
    Asistencia "*" --> "1" AlumnoInscripto : registra
    Asistencia "*" --> "1" HorarioClase : para
    
    %% EVALUACIONES
    class TipoEvaluacion {
        +Long id
        +String tipo
    }
    class Examen {
        +Long id
        +Date fecha
    }
    Examen "*" --> "1" ComisionMateria : evaluacion de
    Examen "*" --> "1" TipoEvaluacion : tipo
    
    class Nota {
        +Long id
        +Double valor
    }
    Nota "*" --> "1" AlumnoInscripto : califica a
    Nota "*" --> "1" Examen : corresponde a
```
