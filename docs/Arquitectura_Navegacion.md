# Arquitectura de Navegación e Interfaz (UI/UX)

> **Lectura Previa Recomendada:** [Arquitectura_Funcional.md](./Arquitectura_Funcional.md) (Define el modelo de dominio y las entidades que sustentan esta navegación).

El objetivo de esta arquitectura de navegación es abandonar el clásico "Panel de Administración" plano (CRUD por entidades sueltas) y migrar hacia una **Navegación Jerárquica Contextual**. El usuario debe operar dentro de contenedores lógicos (Carreras, Planes, Ciclos) sin perder jamás noción de dónde está ubicado.

---

## 1. Estructura del Menú Lateral (Sidebar)

El menú principal actúa como punto de entrada a los grandes dominios del sistema. No expone sub-entidades sueltas (como "Comisiones" o "Asistencias").

* 📊 **Dashboard** (Métricas generales, alertas)
* 🏛️ **Institución** (Configuraciones base)
  * Catálogo de Materias *(Repositorio maestro global)*
  * Usuarios y Roles
* 📚 **Catálogo Académico**
  * Carreras *(Punto de entrada a la estructura permanente)*
* ⚙️ **Gestión Académica**
  * Ciclos Lectivos *(Punto de entrada a la operación temporal)*
* 👥 **Gestión de Estudiantes**
  * Legajos / Buscador
* 🧑‍🏫 **Cuerpo Docente**
  * Profesores / Buscador

---

## 2. Flujo A: Catálogo Académico (Estructura)
*Ruta de configuración de los planes de estudio.*

1. **Listado de Carreras:** (`/carreras`)
   * Tarjetas o grilla con las carreras disponibles.
2. **Dashboard de Carrera:** (`/carreras/:id_carrera`)
   * Pestañas superiores: Info General | **Planes de Estudio**.
3. **Malla del Plan de Estudio:** (`/carreras/:id/planes/:id_plan`)
   * *Breadcrumb:* `Carreras > Des. Software > Plan 2026`
   * Muestra visualmente la cuadrícula de cuatrimestres y las materias asignadas.
4. **Detalle de Materia en Plan:** (`/carreras/:id/planes/:id_plan/materias/:id_materia`)
   * Panel lateral (Drawer) para editar: Carga horaria, Régimen, y configurar sus Materias Correlativas.

---

## 3. Flujo B: Gestión Académica (Operación)
*Ruta de operación diaria, asignación de docentes y carga de notas.*

1. **Listado de Ciclos Lectivos:** (`/ciclos`)
   * Selección del año operativo (ej. 2026).
2. **Dashboard del Ciclo:** (`/ciclos/2026`)
   * Listado de **Períodos Académicos** (ej. "Primer Cuatrimestre").
3. **Oferta Académica del Período:** (`/ciclos/2026/periodos/:id_periodo`)
   * *Breadcrumb:* `Ciclo 2026 > 1º Cuatrimestre`
   * Muestra las Carreras que tienen clases activas en este período.
4. **Grilla de Comisiones:** (`/ciclos/2026/periodos/:id_periodo/oferta/:id_carrera`)
   * Muestra el listado de Materias ofertadas y las **Comisiones** creadas para cada una.
5. **Panel Principal de la Comisión:** (`/comisiones/:id_comision`)
   * *Contexto visual permanente:* Título de la materia, comisión, y cuatrimestre anclados en la cabecera.
   * *Navegación interna (Pestañas/Tabs):*
     * ℹ️ **Info General:** Horarios, Aulas, Profesores.
     * 👥 **Alumnos:** Nómina de inscritos.
     * 📅 **Asistencias:** Planilla de presentismo.
     * 📝 **Calificaciones:** Grilla de notas parciales y estado final.

---

## 4. Reglas Críticas de Interfaz de Usuario (UI)

1. **Breadcrumbs (Migas de Pan):** Obligatorios en todo el sistema. El usuario debe poder saltar 2 niveles hacia arriba (ej. de la Comisión al Ciclo) con un solo clic.
2. **Uso de Pestañas (Tabs) en Nodos Finales:** Cuando se llega a la profundidad máxima (ej. *Comisión* o *Legajo de Alumno*), la navegación en árbol se detiene. Todo el contenido relacionado se organiza en Pestañas horizontales para evitar recargas completas y pérdida de contexto.
3. **Persistencia del Contexto Visual:** Los encabezados de las vistas profundas deben mostrar siempre la ruta de pertenencia (ej. *"Programación I - Com. A | Plan 2026"*).

---

> **Estado (2026-07-08):** la migración hacia esta estructura de navegación (Ciclo → Carrera → Período → Oferta Académica) ya se completó en el refactor a Bounded Contexts DDD — ver `docs/Modelo_Datos.md` para el modelo vigente.
