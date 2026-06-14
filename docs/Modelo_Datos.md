# Modelo de Datos (Diagrama Entidad-Relación)

A continuación se presenta el Modelo de Datos relacional estimado para el backend, estructurado en base a las entidades, sus atributos clave y las claves foráneas (FK) necesarias para relacionarlas de acuerdo con los requerimientos del ITEC N°1.

```mermaid
erDiagram
    %% SEGURIDAD Y ACCESO
    ROLES {
        int id PK
        string nombre
    }
    USUARIOS {
        int id PK
        string username
        string password
        boolean activo
        int rol_id FK
    }
    ROLES ||--o{ USUARIOS : tiene

    %% ACTORES PRINCIPALES
    ALUMNOS {
        int id PK
        string nombre
        string apellido
        string dni
        string email
        string telefono
        boolean activo
    }
    PROFESORES {
        int id PK
        string nombre
        string apellido
        string dni
        string email
        boolean activo
    }

    %% ESTRUCTURA ACADÉMICA
    CARRERAS {
        int id PK
        string nombre
    }
    PLANES_ESTUDIO {
        int id PK
        string resolucion
        date fecha_implementacion
        int carrera_id FK
    }
    CARRERAS ||--o{ PLANES_ESTUDIO : posee

    MATERIAS {
        int id PK
        string nombre
        int plan_estudio_id FK
    }
    PLANES_ESTUDIO ||--o{ MATERIAS : contiene
    
    MATERIAS_CORRELATIVAS {
        int materia_id PK,FK
        int correlativa_id PK,FK
    }
    MATERIAS ||--o{ MATERIAS_CORRELATIVAS : exige_como_correlativa

    CUATRIMESTRES {
        int id PK
        string denominacion
        date fecha_inicio
        date fecha_fin
    }
    
    COMISIONES {
        int id PK
        string codigo_comision
        int materia_id FK
        int cuatrimestre_id FK
        int profesor_id FK
    }
    MATERIAS ||--o{ COMISIONES : dicta
    CUATRIMESTRES ||--o{ COMISIONES : corresponde_a
    PROFESORES ||--o{ COMISIONES : asignado_a

    %% HORARIOS
    MODULOS_HORARIO {
        int id PK
        time hora_inicio
        time hora_fin
    }
    HORARIOS_CLASE {
        int id PK
        string dia_semana
        int comision_id FK
        int modulo_id FK
    }
    COMISIONES ||--o{ HORARIOS_CLASE : ocurre_en
    MODULOS_HORARIO ||--o{ HORARIOS_CLASE : rango_de

    %% INSCRIPCIONES
    ALUMNOS_CARRERAS {
        int id PK
        date fecha_inscripcion
        int alumno_id FK
        int carrera_id FK
    }
    ALUMNOS ||--o{ ALUMNOS_CARRERAS : inscripto_en
    CARRERAS ||--o{ ALUMNOS_CARRERAS : recibe

    ESTADOS_CURSADA {
        int id PK
        string nombre_estado
    }
    ALUMNOS_INSCRIPTOS {
        int id PK
        date fecha_inscripcion
        int alumno_id FK
        int comision_id FK
        int estado_cursada_id FK
    }
    ALUMNOS ||--o{ ALUMNOS_INSCRIPTOS : inscripto_a_cursada
    COMISIONES ||--o{ ALUMNOS_INSCRIPTOS : tiene_alumnos
    ESTADOS_CURSADA ||--o{ ALUMNOS_INSCRIPTOS : define_estado_de

    %% SEGUIMIENTO (ASISTENCIAS Y CALIFICACIONES)
    ASISTENCIAS {
        int id PK
        date fecha
        boolean presente
        int inscripto_id FK
        int horario_id FK
    }
    ALUMNOS_INSCRIPTOS ||--o{ ASISTENCIAS : registra
    HORARIOS_CLASE ||--o{ ASISTENCIAS : se_toma_en

    TIPOS_EVALUACION {
        int id PK
        string tipo
    }
    EXAMENES {
        int id PK
        date fecha
        int comision_id FK
        int tipo_evaluacion_id FK
    }
    COMISIONES ||--o{ EXAMENES : realiza
    TIPOS_EVALUACION ||--o{ EXAMENES : clasificado_como

    NOTAS {
        int id PK
        decimal valor
        int inscripto_id FK
        int examen_id FK
    }
    ALUMNOS_INSCRIPTOS ||--o{ NOTAS : obtiene
    EXAMENES ||--o{ NOTAS : genera
```
