# 002 — Regularidad por asistencia (70 %)

- **Estado:** Borrador
- **Fecha:** 2026-10-06
- **Rama:** `feature/002-regularidad-asistencia`

## Contexto
Resuelve la deuda #37. El enunciado (US-ASIS-02, US-REP-01 y anexo US-ASIS-03/05) exige que un alumno sea REGULAR solo si asistió al 70 % o más de las clases registradas de su cursada, y NO_REGULAR por debajo. Hoy el sistema registra asistencias (presente, ausente, tardanza) pero no calcula ningún porcentaje: al cerrar la cursada, la condición final sale solo del promedio de parciales, así que un alumno con muchas faltas puede quedar regular o promocionado.

Actores: profesor (toma asistencia y cierra la cursada de sus comisiones), administrativo y admin (consultan reportes y cierran cursadas).

## Historias de usuario
- **HU-01** — Como profesor, quiero ver el porcentaje de asistencia y el estado de cada alumno de mi comisión, para anticipar quién está en riesgo de perder la regularidad.
- **HU-02** — Como profesor o administrativo, quiero que al cerrar la cursada el alumno que no llegó al 70 % de asistencia quede libre, para que la condición final respete la regla de regularidad.
- **HU-03** — Como administrativo, quiero un reporte de asistencia por materia, para detectar a los alumnos en riesgo de perder la regularidad.
- **HU-04** — Como profesor o administrativo, quiero consultar las asistencias de un alumno, para ver su presentismo y su historial.

## Requisitos funcionales
| Id | Requisito (EARS) | HU |
|---|---|---|
| RF-01 | EL SISTEMA DEBE calcular el porcentaje de asistencia de un alumno en una cursada como las clases en que estuvo presente dividido el total de clases registradas de su comisión, por 100. | HU-01 |
| RF-02 | EL SISTEMA DEBE contar una tardanza como una clase en que el alumno estuvo presente. | HU-01 |
| RF-03 | EL SISTEMA DEBE considerar como clase registrada de una comisión cada fecha en que se tomó asistencia en ella. [NECESITA ACLARACIÓN: si en una fecha registrada un alumno no tiene marca (por ejemplo, se inscribió después), ¿esa clase cuenta en su total como ausente o no se cuenta?] | HU-01 |
| RF-04 | MIENTRAS el porcentaje de asistencia de un alumno sea mayor o igual a 70 %, EL SISTEMA DEBE informar su estado de asistencia como REGULAR. | HU-01 |
| RF-05 | MIENTRAS el porcentaje de asistencia de un alumno sea menor a 70 %, EL SISTEMA DEBE informar su estado de asistencia como NO_REGULAR. | HU-01 |
| RF-06 | EL SISTEMA DEBE comparar el porcentaje con el 70 % sin redondearlo antes, de modo que 70 % exacto sea REGULAR y 69,9 % sea NO_REGULAR. | HU-01 |
| RF-07 | CUANDO un usuario abre la vista de una comisión, EL SISTEMA DEBE mostrar el porcentaje de asistencia y el estado de asistencia de cada alumno inscripto. | HU-01 |
| RF-08 | SI una comisión no tiene clases registradas, ENTONCES EL SISTEMA DEBE mostrar "Sin registros" en lugar del porcentaje y del estado. | HU-01 |
| RF-09 | CUANDO se cierra la cursada de un alumno con estado de asistencia NO_REGULAR, EL SISTEMA DEBE asignarle la condición final LIBRE, cualquiera sea su promedio de parciales. | HU-02 |
| RF-10 | CUANDO se cierra la cursada de un alumno con estado de asistencia REGULAR, EL SISTEMA DEBE asignarle la condición final que corresponda por su promedio de parciales, como hasta ahora. | HU-02 |
| RF-11 | CUANDO un usuario previsualiza el cierre de una cursada, EL SISTEMA DEBE mostrar el porcentaje de asistencia del alumno e indicar si la condición LIBRE se debe a la asistencia o al promedio. | HU-02 |
| RF-12 | SI se intenta cerrar una cursada de una comisión sin clases registradas, ENTONCES EL SISTEMA DEBE [NECESITA ACLARACIÓN: ¿rechazar el cierre, cerrar solo con el promedio de parciales, o dejar al alumno LIBRE?]. | HU-02 |
| RF-13 | SI al cerrar una cursada no se pueden obtener las asistencias, ENTONCES EL SISTEMA DEBE rechazar el cierre e informar el motivo, sin cambiar la condición del alumno. | HU-02 |
| RF-14 | MIENTRAS una cursada esté cerrada, EL SISTEMA DEBE conservar su condición final aunque después se modifiquen asistencias de esa comisión. | HU-02 |
| RF-15 | CUANDO un administrativo o admin genera el reporte de asistencia de una materia, EL SISTEMA DEBE listar a cada alumno con su porcentaje y su estado de asistencia. [NECESITA ACLARACIÓN: ¿el reporte agrupa todas las comisiones de la materia en un ciclo lectivo, o es por comisión?] | HU-03 |
| RF-16 | CUANDO se genera el reporte de asistencia, EL SISTEMA DEBE destacar a los alumnos con estado NO_REGULAR. | HU-03 |
| RF-17 | SI la materia del reporte no tiene asistencias registradas, ENTONCES EL SISTEMA DEBE informar "Sin registros". | HU-03 |
| RF-18 | CUANDO un usuario consulta las asistencias de un alumno, EL SISTEMA DEBE mostrar, por cada cursada, la cantidad de presentes, tardanzas y ausencias. | HU-04 |
| RF-19 | CUANDO un usuario consulta las asistencias de un alumno, EL SISTEMA DEBE mostrar, por cada cursada, el porcentaje de asistencia y el estado de asistencia. | HU-04 |
| RF-20 | SI el alumno consultado no tiene asistencias registradas, ENTONCES EL SISTEMA DEBE informar "Sin registros". | HU-04 |
| RF-21 | SI un usuario sin rol admin, administrativo o profesor intenta ver un reporte o una consulta de asistencia, ENTONCES EL SISTEMA DEBE rechazar el acceso. | HU-03, HU-04 |
| RF-22 | MIENTRAS el usuario tenga solo el rol profesor, EL SISTEMA DEBE [NECESITA ACLARACIÓN: ¿limitar la consulta por alumno y la vista de comisión a las comisiones que dicta, o mostrarle cualquier alumno?]. | HU-01, HU-04 |

## Casos límite
- Tardanzas → cuentan como presente (RF-02).
- 70 % exacto y 69,9 % → REGULAR y NO_REGULAR (RF-06).
- Alumno sin marca en una fecha registrada (inscripción tardía) → RF-03 (pendiente de aclaración).
- Comisión sin clases registradas → "Sin registros" en la vista (RF-08) y cierre (RF-12, pendiente de aclaración).
- Alumno con buen promedio y asistencia insuficiente → LIBRE al cerrar (RF-09).
- Falla al obtener las asistencias durante el cierre → cierre rechazado (RF-13).
- Asistencias corregidas después del cierre → la condición no cambia (RF-14).
- Reporte o consulta sin datos → "Sin registros" (RF-17, RF-20).
- Acceso de un usuario sin permiso → rechazado (RF-21).

## Fuera de alcance
- Inasistencias justificadas (US-ASIS-04): se registra como pendiente nuevo.
- Recalcular la condición en cada carga de asistencia: el efecto sobre la condición se aplica solo al cerrar la cursada.
- Bloquear la edición de asistencias después del cierre (parte de US-ASIS-05).
- Vencimiento de la regularidad y exámenes finales en condición libre.
- Portal del alumno.

## Preguntas abiertas
- [NECESITA ACLARACIÓN: RF-03 — alumno sin marca en una fecha registrada.]
- [NECESITA ACLARACIÓN: RF-12 — cierre de una comisión sin clases registradas.]
- [NECESITA ACLARACIÓN: RF-15 — alcance del reporte por materia.]
- [NECESITA ACLARACIÓN: RF-22 — qué alumnos y comisiones ve un profesor.]

Resuelto en la entrevista del 2026-10-06: el 70 % afecta la condición solo al cerrar la cursada; la tardanza cuenta como presente; las justificadas quedan fuera de alcance; el porcentaje se muestra en la vista de comisión, en un reporte por materia y en la consulta por alumno.
