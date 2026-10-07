# Pendientes

Única fuente de verdad de tareas abiertas, deuda técnica y funcionalidades diferidas.

- Solo ítems **abiertos**. Al cerrar uno, se borra de este archivo: lo realizado queda en el historial de git.
- Los números son estables (se citan desde otros docs). Un ítem nuevo usa el siguiente número libre: **#45**.

## Deuda técnica
- **#22 [Arquitectura] Acoplamiento sincrónico Core ↔ MS** — dependencia circular en runtime por HTTP REST: el Core depende de `ms-notas` y, desde `specs/002-regularidad-asistencia`, de `ms-asistencias` (resumen de asistencia) para previsualizar y cerrar cursadas; los MS dependen del Core para validar horarios y el estado de las mesas. Si un MS está caído, el cierre de cursada falla (503). **Próximo paso: analizar opciones de desacople** (por ejemplo, eventos asincrónicos con RabbitMQ/Kafka, réplica local de los datos que cada servicio necesita, o mover el cierre a un orquestador) y su costo para un proyecto que corre en local; ver también #42. Cambiar a mensajería requiere enmendar C1.4 de `constitution.md`.
- **#31 [Documentación] Revisar `docs/`** — confirmar que los documentos reflejan el código actual tras los refactors de DDD, Mesas de Examen y horarios/asistencias. Incluye: `02.00-Modelo_Datos.md` dice que ALUMNO/PROFESOR se crean con `enabled=false`, pero los usuarios creados desde la UI quedan habilitados (ver `MEMORY.md`).
- **#41 [Seguridad] Revocar la sesión en el servidor al cerrar sesión** *(baja prioridad)* — el logout borra las cookies del navegador, pero el JWT sigue siendo válido hasta vencer (24 h). Quedó fuera de alcance de `specs/001-sesion-segura`. Requeriría una lista de tokens revocados consultada por el Gateway.
- **#42 [Seguridad] Profesor solo ve sus comisiones, controlado en el backend** *(baja prioridad)* — en `specs/002-regularidad-asistencia`, que un profesor vea solo sus comisiones y alumnos (RF-22, RF-26) se controla en los Server Components de Next, igual que la vista de comisión. `ms-asistencias` y `ms-notas` solo exigen el rol PROFESOR, así que un profesor que llame directo al Gateway puede leer asistencias o notas de otra comisión. Mitigarlo requiere que los MS sepan qué comisiones dicta cada profesor (consulta al Core o claim en el JWT); ver #22.

## Funcionalidad pendiente
- **#44 Inasistencias justificadas (US-ASIS-04)** — estado JUSTIFICADA con motivo obligatorio (certificado opcional) que no cuente como ausencia en la regularidad del 70 %. Quedó fuera de alcance de `specs/002-regularidad-asistencia`; el cálculo vive en `ResumenAsistenciaCalculator` (`ms-asistencias`).
- **#43 Profesor cierra la cursada desde la vista de comisión** — el backend permite al rol PROFESOR previsualizar y cerrar cursadas, y la spec 002 lo nombra como actor (HU-02), pero en `app/dashboard/comisiones/[comisionId]/page.tsx` el botón "Cerrar cursada" solo se muestra a ADMIN/ADMINISTRATIVO. Mostrarlo también al profesor de la comisión.
- **#38 Ciclos en correlativas** — `MateriaPlan.correlativas` no detecta ciclos (A requiere B y B requiere A). Ver `03.10-Diagrama_Secuencia_Inscripciones.md`.

## Diferido por el usuario (no implementar sin pedido explícito)
- **#3 Cursos cortos** — ofertas de duración menor a un cuatrimestre (ej. 4 sábados); no encajan en el modelo centrado en carrera/plan.
- **#13 Habilitación de carga de notas por ADMIN** — pedido textual (2026-07-08): "para futuras versiones, las notas deberán ser habilitadas por el admin para poder cargar". Un profesor no podría cargar notas de una instancia hasta que un ADMIN/ADMINISTRATIVO la habilite.
- **#30 Carga masiva de datos de prueba** — seeder con muchas carreras, materias, profesores, alumnos y comisiones con horarios, para pruebas de rendimiento y estrés.
- **#35 Diagrama de arquitectura interactiva + JSON para agentes** — post-MVP. Los entregables (`docs/arquitectura_interactiva.html`, `docs/arquitectura_agentes.json`) están en la rama `feature/analisis-arquitectura`.
