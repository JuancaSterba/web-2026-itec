# Pendientes

Única fuente de verdad de tareas abiertas, deuda técnica y funcionalidades diferidas.

- Solo ítems **abiertos**. Al cerrar uno, se borra de este archivo: lo realizado queda en el historial de git.
- Los números son estables (se citan desde otros docs). Un ítem nuevo usa el siguiente número libre: **#42**.

## Deuda técnica
- **#22 [Arquitectura] Acoplamiento sincrónico Core ↔ MS** *(baja prioridad)* — dependencia circular en runtime por HTTP REST: el Core depende de `ms-notas` para cerrar cursadas y los MS dependen del Core para validar horarios. A futuro, evaluar comunicación asincrónica por eventos (RabbitMQ/Kafka). Cambiarlo requiere enmendar C1.4 de `constitution.md`.
- **#31 [Documentación] Revisar `docs/`** — confirmar que los documentos reflejan el código actual tras los refactors de DDD, Mesas de Examen y horarios/asistencias. Incluye: `02.00-Modelo_Datos.md` dice que ALUMNO/PROFESOR se crean con `enabled=false`, pero los usuarios creados desde la UI quedan habilitados (ver `MEMORY.md`).
- **#41 [Seguridad] Revocar la sesión en el servidor al cerrar sesión** *(baja prioridad)* — el logout borra las cookies del navegador, pero el JWT sigue siendo válido hasta vencer (24 h). Quedó fuera de alcance de `specs/001-sesion-segura`. Requeriría una lista de tokens revocados consultada por el Gateway.

## Funcionalidad pendiente
- **#37 Regularidad por asistencia (70 %)** — el cálculo del 70 % y la notificación MS Asistencias → Core para que el alumno pierda la regularidad no están implementados (ver `02.20-Diagrama_Estados.md` y `03.20-Diagrama_Secuencia_Asistencia.md`).
- **#38 Ciclos en correlativas** — `MateriaPlan.correlativas` no detecta ciclos (A requiere B y B requiere A). Ver `03.10-Diagrama_Secuencia_Inscripciones.md`.

## Diferido por el usuario (no implementar sin pedido explícito)
- **#3 Cursos cortos** — ofertas de duración menor a un cuatrimestre (ej. 4 sábados); no encajan en el modelo centrado en carrera/plan.
- **#13 Habilitación de carga de notas por ADMIN** — pedido textual (2026-07-08): "para futuras versiones, las notas deberán ser habilitadas por el admin para poder cargar". Un profesor no podría cargar notas de una instancia hasta que un ADMIN/ADMINISTRATIVO la habilite.
- **#30 Carga masiva de datos de prueba** — seeder con muchas carreras, materias, profesores, alumnos y comisiones con horarios, para pruebas de rendimiento y estrés.
- **#35 Diagrama de arquitectura interactiva + JSON para agentes** — post-MVP. Los entregables (`docs/arquitectura_interactiva.html`, `docs/arquitectura_agentes.json`) están en la rama `feature/analisis-arquitectura`.
