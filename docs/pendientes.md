# Pendientes

Única fuente de verdad de tareas abiertas, deuda técnica y funcionalidades diferidas.

- Solo ítems **abiertos**. Al cerrar uno, se borra de este archivo: lo realizado queda en el historial de git.
- Los números son estables (se citan desde otros docs). Un ítem nuevo usa el siguiente número libre: **#41**.

## Deuda técnica
- **#22 [Arquitectura] Acoplamiento sincrónico Core ↔ MS** *(baja prioridad)* — dependencia circular en runtime por HTTP REST: el Core depende de `ms-notas` para cerrar cursadas y los MS dependen del Core para validar horarios. A futuro, evaluar comunicación asincrónica por eventos (RabbitMQ/Kafka). Cambiarlo requiere enmendar C1.4 de `constitution.md`.
- **#31 [Documentación] Revisar `docs/`** — confirmar que los documentos reflejan el código actual tras los refactors de DDD, Mesas de Examen y horarios/asistencias. Incluye: `02.00-Modelo_Datos.md` dice que ALUMNO/PROFESOR se crean con `enabled=false`, pero los usuarios creados desde la UI quedan habilitados (ver `MEMORY.md`).
- **#36 [Seguridad] JWT y datos personales en `localStorage`** — `frontend/hooks/use-auth.tsx` hace el login desde el cliente con `apiClient` y guarda `token` en `localStorage` además de la cookie; `frontend/app/perfil/page.tsx` lee nombre/DNI/roles de `localStorage`. Viola C2.4/C4.5 de `constitution.md`. Migrar el login a una Server Action que setee una cookie `httpOnly` y leer el perfil del lado del servidor.

## Funcionalidad pendiente
- **#37 Regularidad por asistencia (70 %)** — el cálculo del 70 % y la notificación MS Asistencias → Core para que el alumno pierda la regularidad no están implementados (ver `02.20-Diagrama_Estados.md` y `03.20-Diagrama_Secuencia_Asistencia.md`).
- **#38 Ciclos en correlativas** — `MateriaPlan.correlativas` no detecta ciclos (A requiere B y B requiere A). Ver `03.10-Diagrama_Secuencia_Inscripciones.md`.

## Diferido por el usuario (no implementar sin pedido explícito)
- **#3 Cursos cortos** — ofertas de duración menor a un cuatrimestre (ej. 4 sábados); no encajan en el modelo centrado en carrera/plan.
- **#13 Habilitación de carga de notas por ADMIN** — pedido textual (2026-07-08): "para futuras versiones, las notas deberán ser habilitadas por el admin para poder cargar". Un profesor no podría cargar notas de una instancia hasta que un ADMIN/ADMINISTRATIVO la habilite.
- **#30 Carga masiva de datos de prueba** — seeder con muchas carreras, materias, profesores, alumnos y comisiones con horarios, para pruebas de rendimiento y estrés.
- **#35 Diagrama de arquitectura interactiva + JSON para agentes** — post-MVP. Los entregables (`docs/arquitectura_interactiva.html`, `docs/arquitectura_agentes.json`) están en la rama `feature/analisis-arquitectura`.
