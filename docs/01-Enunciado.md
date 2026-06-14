# ? PROYECTO FINAL

# BACKOFFICE ACADÉMICO – ITEC N°1

# 1?? Introducción

El Instituto Tecnológico N°1 (ITEC N°1) requiere el desarrollo de un sistema de gestión académica centralizado que permita modernizar sus procesos administrativos y académicos.

Actualmente, gran parte de la información se gestiona de manera manual o mediante herramientas dispersas, lo que genera ineficiencias y dificultades en el seguimiento académico.

El presente documento describe el escenario general del proyecto.

# 2?? Objetivo del Sistema

Desarrollar un sistema de gestión académica que permita:

* Centralizar la información institucional
* Gestionar alumnos, profesores y materias
* Registrar asistencias y calificaciones
* Aplicar reglas académicas (regularidad y correlativas)
* Generar reportes académicos
* Garantizar acceso seguro mediante autenticación

El sistema debe desarrollarse en **Java**, utilizando arquitectura **en capas (MVC)**.

El proyecto es **agnóstico a plataforma**:

* Puede implementarse como aplicación Web.
* Puede implementarse como aplicación Desktop.
* Puede ser API + Cliente.
* Debe ser arquitectura en capas.

# 3?? Alcance Funcional

El sistema deberá incluir:

## 3.1 Gestión de Acceso

* Login mediante usuario y contraseña.
* Roles diferenciados: Docente y Administrativo, Alumno, Administrador.
* Control de permisos por rol.

## 3.2 Gestión Académica

* Gestión de alumnos.
* Gestión de profesores.
* Gestión de materias.
* Gestión de asistencias.
* Gestión de calificaciones.
* Validación de correlativas.
* Cálculo de regularidad (mínimo 70% de asistencia).
* Generación de reportes académicos.

# 4?? Requisitos Técnicos

* Lenguaje: Java
* Arquitectura: capas MVC
* Persistencia: Base de datos relacional/no Relacional
* Script SQL obligatorio
* Uso de Git y GitHub
* Aplicación de Git Flow
* Documentación en carpeta /document

# 5?? Diagramas Obligatorios

* Diagrama de Arquitectura
* Diagrama de clases
* Diagrama de secuencia
* Diagrama de estados (estado académico del alumno)
* Modelo de datos

# 6?? Entregables

* Repositorio GitHub completo
* README descripción del proyecto y con integrantes
* Script SQL
* Proyecto ejecutable con instrucciones en docker
* Diagramas

# 7?? Modalidad de Evaluación

Cada integrante deberá:

* Explicar una parte del sistema
* Defender decisiones técnicas
* Responder preguntas teóricas sobre:
  + MVC
  + POO
  + Persistencia
  + Git
  + Reglas de negocio
