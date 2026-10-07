# 002 — Regularidad por asistencia (70 %)

- **Estado:** Clarificada
- **Fecha:** 2026-10-06
- **Rama:** `feature/002-regularidad-asistencia`

## Contexto
Resuelve la deuda #37. El enunciado (US-ASIS-02, US-REP-01 y anexo US-ASIS-03/05) exige que un alumno sea REGULAR solo si asistió al 70 % o más de sus clases, y NO_REGULAR por debajo. Hoy el sistema registra asistencias (presente, ausente, tardanza) pero no calcula ningún porcentaje: al cerrar la cursada, la condición final sale solo del promedio de parciales, así que un alumno con muchas faltas puede quedar regular o promocionado.

Actores: profesor (toma asistencia y cierra la cursada de sus comisiones), administrativo y admin (consultan reportes y cierran cursadas). Como en la spec 001, los permisos dependen de los roles del usuario, no del rol activo.

## Historias de usuario
- **HU-01** — Como profesor, quiero ver el porcentaje de asistencia y el estado de cada alumno de mi comisión, para anticipar quién está en riesgo de perder la regularidad.
- **HU-02** — Como profesor o administrativo, quiero que al cerrar la cursada el alumno que no llegó al 70 % de asistencia quede libre, para que la condición final respete la regla de regularidad.
- **HU-03** — Como administrativo, quiero un reporte de asistencia por materia, para detectar a los alumnos en riesgo de perder la regularidad.
- **HU-04** — Como profesor o administrativo, quiero consultar las asistencias de un alumno, para ver su presentismo y su historial.

## Requisitos funcionales
| Id | Requisito (EARS) | HU |
|---|---|---|
| RF-01 | EL SISTEMA DEBE calcular el porcentaje de asistencia de un alumno en una cursada como las clases en que estuvo presente dividido su total de clases (RF-03), por 100. | HU-01 |
| RF-02 | EL SISTEMA DEBE contar una tardanza como una clase en que el alumno estuvo presente. | HU-01 |
| RF-03 | EL SISTEMA DEBE tomar como total de clases de un alumno las fechas de su comisión en que tiene una marca de asistencia (presente, tardanza o ausente); una fecha sin marca para ese alumno no se cuenta. | HU-01 |
| RF-04 | MIENTRAS el porcentaje de asistencia de un alumno sea mayor o igual a 70 %, EL SISTEMA DEBE informar su estado de asistencia como REGULAR. | HU-01 |
| RF-05 | MIENTRAS el porcentaje de asistencia de un alumno sea menor a 70 %, EL SISTEMA DEBE informar su estado de asistencia como NO_REGULAR. | HU-01 |
| RF-06 | EL SISTEMA DEBE comparar el porcentaje con el 70 % sin redondearlo antes, de modo que 70 % exacto sea REGULAR y 69,9 % sea NO_REGULAR. | HU-01 |
| RF-07 | CUANDO un usuario abre la vista de una comisión, EL SISTEMA DEBE mostrar el porcentaje de asistencia y el estado de asistencia de cada alumno inscripto. | HU-01 |
| RF-08 | SI un alumno no tiene ninguna clase con marca en su cursada, ENTONCES EL SISTEMA DEBE mostrar "Sin registros" en lugar de su porcentaje y su estado. | HU-01 |
| RF-09 | CUANDO se cierra la cursada de un alumno con estado de asistencia NO_REGULAR, EL SISTEMA DEBE asignarle la condición final LIBRE, cualquiera sea su promedio de parciales. | HU-02 |
| RF-10 | CUANDO se cierra la cursada de un alumno con estado de asistencia REGULAR, EL SISTEMA DEBE asignarle la condición final que corresponda por su promedio de parciales, como hasta ahora. | HU-02 |
| RF-11 | CUANDO un usuario previsualiza el cierre de una cursada, EL SISTEMA DEBE mostrar el porcentaje de asistencia del alumno. | HU-02 |
| RF-12 | SI se intenta cerrar la cursada de un alumno sin ninguna clase con marca, ENTONCES EL SISTEMA DEBE rechazar el cierre con el mensaje "No hay asistencias registradas para este alumno en la comisión". | HU-02 |
| RF-13 | SI al cerrar una cursada no se pueden obtener las asistencias, ENTONCES EL SISTEMA DEBE rechazar el cierre sin cambiar la condición del alumno. | HU-02 |
| RF-14 | MIENTRAS una cursada esté cerrada, EL SISTEMA DEBE conservar su condición final aunque después se modifiquen asistencias de esa comisión. | HU-02 |
| RF-15 | CUANDO un administrativo o admin genera el reporte de asistencia de una materia en un ciclo lectivo, EL SISTEMA DEBE listar a los alumnos de todas sus comisiones con su comisión, su porcentaje y su estado de asistencia. | HU-03 |
| RF-16 | CUANDO se genera el reporte de asistencia, EL SISTEMA DEBE listar primero a los alumnos con estado NO_REGULAR y marcarlos con un indicador visible. | HU-03 |
| RF-17 | SI la materia no tiene asistencias registradas en el ciclo lectivo del reporte, ENTONCES EL SISTEMA DEBE informar "Sin registros". | HU-03 |
| RF-18 | CUANDO un usuario consulta las asistencias de un alumno, EL SISTEMA DEBE mostrar, por cada cursada, la cantidad de presentes, tardanzas y ausencias. | HU-04 |
| RF-19 | CUANDO un usuario consulta las asistencias de un alumno, EL SISTEMA DEBE mostrar, por cada cursada, el porcentaje de asistencia y el estado de asistencia. | HU-04 |
| RF-20 | SI el alumno consultado no tiene asistencias registradas, ENTONCES EL SISTEMA DEBE informar "Sin registros". | HU-04 |
| RF-21 | SI un usuario sin rol admin ni administrativo intenta generar el reporte de asistencia, ENTONCES EL SISTEMA DEBE rechazar el acceso. | HU-03 |
| RF-22 | MIENTRAS un usuario solo tenga el rol profesor, EL SISTEMA DEBE mostrarle porcentajes de asistencia únicamente de las comisiones que dicta. | HU-01 |
| RF-23 | CUANDO un usuario previsualiza el cierre de una cursada con condición LIBRE, EL SISTEMA DEBE indicar si se debe a la asistencia o al promedio de parciales. | HU-02 |
| RF-24 | SI se rechaza un cierre por no poder obtener las asistencias, ENTONCES EL SISTEMA DEBE informar el motivo al usuario. | HU-02 |
| RF-25 | SI un usuario sin rol admin, administrativo o profesor intenta consultar las asistencias de un alumno, ENTONCES EL SISTEMA DEBE rechazar el acceso. | HU-04 |
| RF-26 | SI un usuario que solo tiene el rol profesor consulta a un alumno que no cursa en ninguna de sus comisiones, ENTONCES EL SISTEMA DEBE rechazar la consulta. | HU-04 |

## Casos límite
- Tardanzas → cuentan como presente (RF-02).
- 70 % exacto y 69,9 % → REGULAR y NO_REGULAR (RF-06).
- Alumno sin marca en algunas fechas de la comisión (inscripción tardía) → esas fechas no cuentan en su total (RF-03).
- Alumno sin ninguna clase con marca, o comisión sin clases → "Sin registros" en la vista (RF-08) y cierre rechazado (RF-12).
- Alumno con buen promedio y asistencia insuficiente → LIBRE al cerrar (RF-09), indicando el motivo en la vista previa (RF-23).
- Falla al obtener las asistencias durante el cierre → cierre rechazado con motivo (RF-13, RF-24).
- Asistencias corregidas después del cierre → la condición no cambia (RF-14).
- Reporte o consulta sin datos → "Sin registros" (RF-17, RF-20).
- Acceso sin permiso al reporte o a la consulta → rechazado (RF-21, RF-25).
- Profesor que consulta un alumno ajeno a sus comisiones → rechazado (RF-26).

## Fuera de alcance
- Inasistencias justificadas (US-ASIS-04): se registra como pendiente nuevo.
- Recalcular la condición en cada carga de asistencia: el efecto sobre la condición se aplica solo al cerrar la cursada.
- Bloquear la edición de asistencias después del cierre (parte de US-ASIS-05).
- Impedir la inscripción o la nota de un final a un alumno NO_REGULAR (US-CAL): las mesas están desacopladas de la cursada.
- Vencimiento de la regularidad y exámenes finales en condición libre.
- Portal del alumno.

## Preguntas abiertas
- Ninguna.

## Clarificación (2026-10-06)
- **Entrevista:** el 70 % afecta la condición solo al cerrar la cursada; la tardanza cuenta como presente; las justificadas quedan fuera de alcance; el porcentaje se muestra en la vista de comisión, en un reporte por materia y en la consulta por alumno.
- **Q-01:** una fecha sin marca para el alumno no cuenta en su total → RF-01, RF-03. Interpreta "total de clases registradas" del enunciado como las clases registradas para ese alumno.
- **Q-02:** sin clases con marca, el cierre se rechaza → RF-12. Se aplica por alumno, en línea con Q-01.
- **Q-03:** el reporte es por materia y ciclo lectivo, con todas sus comisiones → RF-15, RF-17.
- **Q-04:** un usuario que solo es profesor ve sus comisiones; el reporte es solo para admin y administrativo → RF-21, RF-22, RF-26.
- **Redacción:** RF-11 y RF-13 tenían dos "DEBE" y se partieron (RF-23, RF-24). "Destacar" en RF-16 pasó a "listar primero y marcar con un indicador". Se separó el acceso al reporte (RF-21) del de la consulta (RF-25).
