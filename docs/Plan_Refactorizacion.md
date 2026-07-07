# Plan de Refactorización Incremental

> **Lecturas Previas:** 
> 1. [Arquitectura_Funcional.md](./Arquitectura_Funcional.md)
> 2. [Arquitectura_Navegacion.md](./Arquitectura_Navegacion.md)

Este documento detalla el *Roadmap* para migrar el sistema desde su estado actual (pantallas independientes / entidades planas) hacia la nueva arquitectura jerárquica contextual, de manera incremental y sin interrumpir la operación.

---

## Etapa 1: Adaptación del "Cascarón" (Layout y Menú)
**Objetivo:** Cambiar el modelo mental del usuario mediante la reorganización del menú principal, sin alterar drásticamente la base de datos ni los flujos internos de las pantallas existentes.

* **Pantallas afectadas:** Menú Lateral (Sidebar), Layout principal, Cabecera (Header).
* **Cambios en la Navegación:**
  * Crear las agrupaciones visuales en el menú: "Catálogo Académico" y "Gestión Académica".
  * Mover el acceso a "Materias" bajo una pestaña de "Configuración Institucional".
  * Eliminar accesos directos de primer nivel que rompan la jerarquía (ej. "Comisiones" sueltas).
* **Cambios en el Modelo de Datos:** Ninguno.
* **Cambios en la UI:** 
  * Implementación de un componente global de **Breadcrumbs** (Migas de pan).
* **Riesgos:** Desorientación inicial del usuario (no encuentra el botón donde estaba antes) y enlaces guardados en favoritos que queden huérfanos.
* **Beneficios:** Mejora inmediata de la percepción del sistema y prepara la interfaz para alojar las pantallas anidadas.

---

## Etapa 2: Jerarquización del Catálogo Académico
**Objetivo:** Implementar la estructura inmutable: `Carrera -> Plan de Estudio -> Materia en Plan`.

* **Pantallas afectadas:** ABM de Carreras, ABM de Planes de Estudio, Asignación de Materias.
* **Cambios en la Navegación:**
  * Creación del flujo de rutas anidadas: `/carreras/:id/planes/:id_plan`.
* **Cambios en el Modelo de Datos:**
  * Verificar/Crear la tabla `Materia_Plan` (entidad pivot) que une el catálogo maestro de materias con un plan específico, absorbiendo atributos como "Cuatrimestre", "Correlativas" y "Carga Horaria".
* **Cambios en la UI:**
  * Nueva pantalla: "Dashboard del Plan de Estudio" donde se visualiza la Malla Curricular (grid de cuatrimestres).
* **Riesgos:** Si la base actual asignaba materias directamente a la Carrera sin pasar por un Plan, el script de migración de datos requerirá crear "Planes Legacy (Por defecto)" para reasignar esa data.
* **Beneficios:** Soluciona el problema de materias duplicadas y establece un esquema robusto para futuros cambios de currícula.

---

## Etapa 3: Estructuración de la Gestión Operativa
**Objetivo:** Encapsular la operación diaria en contenedores de tiempo, pasando a la estructura `Ciclo -> Período -> Comisión`.

* **Pantallas afectadas:** ABM de Comisiones, Oferta Académica.
* **Cambios en la Navegación:**
  * Rutas orientadas al tiempo: `/ciclos/:anio/periodos/:id_periodo/comisiones`.
* **Cambios en el Modelo de Datos:**
  * Creación de tablas `Ciclo_Lectivo` y `Periodo_Academico` si no existen.
  * Modificar la tabla `Comision` para que referencie a un `Periodo_Academico` y a una `Materia_Plan`.
* **Cambios en la UI:**
  * Nuevas pantallas de selección obligatoria ("Seleccionar Año" -> "Seleccionar Cuatrimestre") antes de ver listados de clases.
* **Riesgos:** Las comisiones antiguas ("Legacy") en la base de datos que no tenían año/cuatrimestre asignado deberán agruparse en un ciclo "Histórico" provisorio para no romper el sistema.
* **Beneficios:** Permite tener historia académica real y filtrar automáticamente datos obsoletos (el sistema mostrará por defecto las cosas del cuatrimestre actual).

---

## Etapa 4: Centralización Contextual (El Puente)
**Objetivo:** Eliminar pantallas aisladas de Asistencias y Calificaciones, integrándolas como "Pestañas" dentro de la Comisión.

* **Pantallas afectadas:** ABM de Asistencias, ABM de Notas/Calificaciones, Detalle de Comisión.
* **Cambios en la Navegación:**
  * Desaparecen rutas como `/asistencias`. Todo pasa a ser `/comisiones/:id/asistencias` y `/comisiones/:id/calificaciones`.
* **Cambios en el Modelo de Datos:**
  * Refuerzo de la entidad `Cursada` (Inscripción de un Alumno a una Comisión). Las notas y presentismo deben atarse estrictamente a esta cursada.
* **Cambios en la UI:**
  * Rediseño total del Dashboard de la Comisión, implementando sub-navegación por **Tabs** (Info, Alumnos, Notas, Asistencia).
* **Riesgos:** Alto impacto operativo. Es la pantalla más usada por los profesores. Un bug aquí paraliza el dictado de clases.
* **Beneficios:** Alineación total con el modelo de Dominio. UX altamente profesional (el profesor "entra al aula" y desde ahí hace todo, sin saltar a otros módulos).

---

> **Lectura Siguiente Recomendada:** [Diseno_UX_UI.md](./Diseno_UX_UI.md) (Define cómo se traduce esta refactorización en una experiencia de usuario moderna, jerárquica y libre de fricciones).

> **Plan Técnico Asociado:** [Plan_Refactorizacion_Backend.md](./Plan_Refactorizacion_Backend.md) (Detalle técnico de los cambios a realizar en el código Java y Spring Boot para soportar esta arquitectura).
