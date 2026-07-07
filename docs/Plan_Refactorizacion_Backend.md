# Plan de Refactorización del Backend (Microservicios)

> **Contexto:** Dado que el sistema utiliza una arquitectura de Microservicios (`backend` o Core, `ms-notas`, `ms-asistencias`, `api-gateway`), este plan detalla la migración estructurada respetando los *Bounded Contexts* (Límites de Dominio) de cada servicio.

Como es un entorno de desarrollo temprano y los datos son descartables, **aprovecharemos para regenerar la base de datos (Drop/Create)**, lo que acelerará drásticamente la migración.

---

## Fase 1: Microservicio CORE (`backend/core`) - El Catálogo
**Objetivo:** Establecer la jerarquía base de Carreras, Planes y Materias.

* **1.1: Catálogo Independiente**
  * Limpiar `Materia.java` (quitar atributos de plan/cuatrimestre).
  * Crear/Ajustar `Carrera.java`.
  * Crear `CicloLectivo.java`.
* **1.2: El Puente Curricular**
  * Ajustar `PlanEstudio.java`.
  * Crear `MateriaPlan.java` (Entidad Pivot que almacena carga horaria y cuatrimestre).
  * Reestructurar `Correlatividades` para apuntar a `MateriaPlan`.

## Fase 2: Microservicio CORE - La Operación y Trazabilidad
**Objetivo:** Crear los contenedores de tiempo y las Cursadas.

* **2.1: Gestión del Tiempo**
  * Crear `PeriodoAcademico.java` (depende de CicloLectivo).
* **2.2: Refactor de Comisiones**
  * Renombrar `ComisionMateria.java` a `Comision.java`.
  * Vincular `Comision` a `PeriodoAcademico` y a `MateriaPlan` (No a Materia suelta).
* **2.3: La Entidad de Nexo (Cursada)**
  * Convertir `AlumnoInscripto.java` en `Cursada.java`.
  * Esta tabla será el "Contrato" (`cursadaId`) que consumirán los otros microservicios.

## Fase 3: Microservicio `ms-notas`
**Objetivo:** Alinear las calificaciones a la nueva entidad `Cursada`.

* **3.1: Desacople de Entidades**
  * Actualmente, `Examen` y `Nota` apuntan al `comisionId`. Deben ser refactorizadas.
  * Crear `CalificacionParcial.java` (o renombrar las actuales) que apunte a un `Long cursadaId`. 
  * *Nota de Microservicios:* `ms-notas` no conoce la entidad Alumno ni Comisión, solo guarda la relación de la nota con el `cursadaId` (o `comisionId` + `alumnoId`).

## Fase 4: Microservicio `ms-asistencias`
**Objetivo:** Alinear el presentismo a la nueva entidad `Cursada`.

* **4.1: Refactor de Asistencia**
  * La clase `Asistencia.java` actualmente debe estar apuntando a `comisionId` o a `horarioId`. Debe refactorizarse para que su clave primaria de negocio sea el `Long cursadaId`.

---

## Estrategia de Ejecución y Pruebas
1. **Drop DB:** Borrar las bases de datos locales.
2. **Refactor Core:** Implementar Fase 1 y 2 en el microservicio Core y levantar para que Hibernate genere las tablas.
3. **Data Seeder:** Crear un script (Data.sql o CommandLineRunner en Spring) para poblar el Core con 1 Carrera, 1 Plan, 3 Materias, 1 Ciclo, 1 Período, 2 Comisiones y 5 Alumnos (Cursadas). Esto nos dará los IDs base.
4. **Refactor Satélites:** Aplicar Fase 3 y 4 en `ms-notas` y `ms-asistencias`.
5. **Pruebas de Integración:** Verificar a través del `api-gateway` que todo el ecosistema responde correctamente.
