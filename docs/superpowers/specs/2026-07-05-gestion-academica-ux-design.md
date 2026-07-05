# Especificación de Diseño: Módulo de Gestión Académica (Frontend UX)

## 1. Visión General
El objetivo es construir las interfaces de usuario (Frontend) para el núcleo académico del sistema, basándose en un diseño fuertemente jerárquico. La información estructural se separa de la información operativa (ciclo lectivo actual), y toda la gestión del día a día (alumnos, notas, asistencia) se centraliza en un único **Dashboard de Comisión**.

## 2. Estructura de Navegación (Sidebar)
La navegación se dividirá lógicamente según el tipo de datos y el rol del usuario:

### Catálogo Académico (Solo Administrativos/Admins)
Módulo dedicado exclusivamente al ABM (Alta/Baja/Modificación) de la estructura inamovible de la institución:
- **Carreras:** Gestión de carreras.
- **Materias y Planes de Estudio:** Gestión de las materias que componen cada carrera.

### Gestión de Cursadas (Administrativos/Admins)
Módulo operativo para gestionar el año en curso:
- **Cuatrimestres / Periodos:** Apertura de ciclos lectivos.
- **Comisiones:** Creación de las clases físicas/virtuales, asignación de profesores y matriculación general.

### Mis Comisiones (Vista del Profesor)
- Acceso directo para que cada Profesor vea un listado únicamente de las comisiones que tiene asignadas en el cuatrimestre activo.

## 3. Dashboard de la Comisión (Centro de Gestión)
Al ingresar a una comisión específica, el usuario (Admin o Profesor) visualizará una pantalla unificada. 
**Cabecera:** Información fija (Nombre de materia, Carrera, Profesor asignado, Horarios).
**Navegación Interna:** Tres pestañas (tabs) principales.

### Pestaña A: Alumnos Inscriptos
- **Propósito:** Mostrar la nómina de la comisión.
- **Acciones Admin:** Añadir/Eliminar alumnos de la comisión (Inscripción).
- **Acciones Profesor:** Solo lectura.

### Pestaña B: Exámenes y Notas
- **Propósito:** Gestión de evaluaciones.
- **Acciones:**
  - Botón "Crear Nuevo Examen" (Tipos: Parcial, TP, Recuperatorio, Final).
  - Al hacer clic en un examen existente, se abre una vista detallada (o Modal) centrada en la carga.
  - **UX de Carga de Notas:** Una tabla simple donde cada fila es un alumno inscripto y la columna derecha contiene un `input` numérico. Se guardan las notas asociadas al examen.

### Pestaña C: Asistencias
- **Propósito:** Registro diario de presentismo.
- **Acciones:**
  - Botón "Registrar Asistencia de Hoy" (o elegir fecha).
  - **UX de Carga de Asistencia:** Al iniciar el registro, aparece la nómina de alumnos con un estado visual de tipo Checkbox o Toggle. Todos los alumnos inician en estado "Presente" (checked) por defecto. El profesor solo desmarca a los ausentes para acelerar la carga.
  - Vista del historial de clases dictadas.

## 4. Lógica de Roles y Restricciones
- **Administrador / Administrativo:** Tiene permisos totales de lectura, escritura y estructuración en todos los módulos.
- **Profesor:** El menú de "Catálogo" y "Gestión de Cursadas" estará oculto. Solo puede interactuar con sus comisiones (vía "Mis Comisiones"). Dentro de la comisión, puede crear exámenes, asignar notas y registrar asistencia.

## 5. Decisiones Técnicas y Consideraciones
- **UI de Componentes:** Se utilizarán tablas y pestañas limpias. El diseño seguirá priorizando la usabilidad sobre la carga de datos.
- **Escalabilidad Futura:** Esta etapa es de diseño estrictamente jerárquico. Una vez validada por el uso diario, se desarrollarán "Acciones Rápidas" (atajos) para evitar clics de navegación en las tareas repetitivas.
- **Integración Backend:** La UI consumirá los RequestParams ya implementados (`?comisionId=X`) en `ms-notas` y `ms-asistencias` para asegurar que el server devuelva exactamente lo que requiere la vista jerárquica.
