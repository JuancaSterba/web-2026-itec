# 002 — Tareas: Regularidad por asistencia (70 %)

- **Plan:** [`plan.md`](./plan.md)
- **Progreso:** 2/24

> El frontend no tiene test runner (C1.2): sus tareas se marcan `[sin test: sin test runner en frontend]` y se verifican con `npm run build` y el E2E de la Fase 4. Maven con JDK 17.

## Fase 1 — `ms-asistencias`: cálculo y endpoint
- [x] T01 [RF-01, RF-02, RF-04, RF-05, RF-06, RF-08] Escribir `ResumenAsistenciaCalculatorTest`: tardanza cuenta como presente, porcentaje sobre clases con marca, 7/10 es REGULAR, 699/1000 es NO_REGULAR, sin marcas es SIN_REGISTROS con porcentaje null — Hecho cuando: el test existe y falla porque las clases no existen.
- [x] T02 [RF-01, RF-02, RF-04, RF-05, RF-06, RF-08] Crear `ResumenAsistenciaResponse` y `ResumenAsistenciaCalculator.resumir(cursadaId, estados)` con la comparación entera del plan (después de T01) — Hecho cuando: T01 pasa y `mvn test` de `ms-asistencias` está en verde.
- [ ] T03 [RF-03, RF-08] Escribir en `AsistenciaServiceTest` los casos `resumir_cuentaSoloLasFechasConMarcaDelAlumno` y `resumir_cursadaSinFilasDevuelveSinRegistros` (un elemento por cada `cursadaId` pedido) — Hecho cuando: los tests existen y fallan porque `resumir` no existe.
- [ ] T04 [RF-03, RF-08] Agregar `findByCursadaIdIn` en `AsistenciaRepository` y `AsistenciaService.resumir(List<Long>)` (después de T02, T03) — Hecho cuando: T03 pasa y `mvn test` de `ms-asistencias` está en verde.
- [ ] T05 [RF-07, RF-15, RF-19, RF-25] Agregar `GET /api/asistencias/resumen?cursadaIds=` en `AsistenciaController` con `RoleGuard` (ADMIN, ADMINISTRATIVO, PROFESOR) y 400 si la lista está vacía (después de T04) [sin test unitario: se verifica por curl en T12] — Hecho cuando: `mvn test` de `ms-asistencias` está en verde.

## Fase 2 — Core: cierre con asistencia
- [ ] T06 [RF-09, RF-10, RF-11, RF-12, RF-13, RF-23, RF-24] Agregar a `CondicionCursadaServiceTest` el mock de `AsistenciasClient` (REGULAR en los casos existentes) y los casos nuevos: NO_REGULAR queda LIBRE con promedio alto y sin parciales, REGULAR sigue la regla actual, informa porcentaje y `motivoLibre` (ASISTENCIA / PROMEDIO), SIN_REGISTROS da 400, falla del cliente da 503 — Hecho cuando: los tests existen y fallan porque `AsistenciasClient` y los campos nuevos no existen.
- [ ] T07 [RF-09, RF-10, RF-11, RF-12, RF-13, RF-23, RF-24] Crear `ResumenAsistenciaDto` y `AsistenciasClient` (como `NotasClient`, 503 ante error), agregar `porcentajeAsistencia`, `estadoAsistencia` y `motivoLibre` a `CondicionPreviewResponse` y reescribir `CondicionCursadaService.calcular` según el plan (después de T06) — Hecho cuando: T06 pasa y `mvn test` de `backend` está en verde.
- [ ] T08 [RF-14] Escribir `CondicionCursadaServiceTest.cerrar_cursadaYaCerradaDevuelve409` — Hecho cuando: el test existe y falla porque hoy se puede recerrar.
- [ ] T09 [RF-14] Rechazar en `CondicionCursadaService.cerrar` una cursada con `condicionFinal` ya asignada (409 "La cursada ya está cerrada") (después de T07, T08) — Hecho cuando: T08 pasa y `mvn test` de `backend` está en verde.
- [ ] T10 [RF-09] Agregar `asistencias.api.url: ${ASISTENCIAS_API_URL:http://localhost:8083}` en `backend/api/src/main/resources/application.yml` (después de T07) [sin test: configuración] — Hecho cuando: `mvn test` de `backend` está en verde.
- [ ] T11 [RF-09] Agregar `ASISTENCIAS_API_URL=http://ms-asistencias:8083` al servicio `backend-app` en `backend/docker-compose.yml` (aprobado en el plan) [sin test: infraestructura] — Hecho cuando: `docker compose config` muestra la variable en `backend-app`.
- [ ] T12 [RF-07, RF-09, RF-11, RF-12, RF-13, RF-23, RF-24, RF-25] Reconstruir `ms-asistencias` y `backend-app` y verificar por el Gateway: resumen con datos y con una cursada sin filas, 403 con un rol sin permiso, preview con `porcentajeAsistencia` y `motivoLibre`, 400 sin registros y 503 con `ms-asistencias` apagado (después de T05, T09, T11) — Hecho cuando: cada caso da el resultado esperado.

## Fase 3 — Frontend
- [ ] T13 [RF-07, RF-08] Crear `types/ResumenAsistencia.ts` y `lib/asistencia.ts` (`fetchResumenAsistencia(cursadaIds)` y la etiqueta "Sin registros") [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T14 [RF-07, RF-08, RF-22] Agregar la columna "Asistencia" (porcentaje + badge de estado o "Sin registros") en `app/dashboard/comisiones/[comisionId]/page.tsx`, con el control de acceso que ya tiene (después de T13) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T15 [RF-11, RF-24] Agregar `previsualizarCierre(cursadaId)` en `cursada-actions.ts` y hacer que `cerrarCursada` devuelva el mensaje de error del backend (después de T13) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T16 [RF-11, RF-12, RF-23, RF-24] En `cerrar-cursada-boton.tsx`, mostrar un diálogo de confirmación con porcentaje, condición y motivo de LIBRE, y los errores del cierre con `toast.error` (después de T15) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T17 [RF-15, RF-16, RF-17, RF-21] Crear `app/dashboard/reportes/asistencia/page.tsx`: formulario GET (materia, ciclo), tabla con comisión, porcentaje y estado, NO_REGULAR primero y marcados, "Sin registros", y acceso solo para ADMIN/ADMINISTRATIVO (después de T13) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T18 [RF-21] Agregar el ítem "Reporte de asistencia" en `components/layout/sidebar.tsx` para ADMIN y ADMINISTRATIVO (después de T17) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [ ] T19 [RF-18, RF-19, RF-20, RF-26] Agregar la sección "Asistencia por cursada" en `app/dashboard/alumnos/[alumnoId]/page.tsx` (presentes, tardanzas, ausencias, porcentaje, estado, "Sin registros") y permitir el acceso de un profesor solo si el alumno cursa en sus comisiones (después de T13) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.

## Fase 4 — Verificación E2E (Docker + navegador)
- [ ] T20 [RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-13, RF-14, RF-22, RF-23, RF-24] Con `docker compose up --build -d`, verificar la columna de asistencia, "Sin registros", el diálogo de cierre (LIBRE por asistencia y por promedio), cierre rechazado sin asistencias y con `ms-asistencias` apagado, recierre rechazado y que un profesor no vea comisiones ajenas (después de T19) — Hecho cuando: cada RF listado tiene su resultado anotado como OK.
- [ ] T21 [RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-25, RF-26] Verificar el reporte (con y sin datos, orden y marca de NO_REGULAR), el acceso de un profesor al reporte, el detalle del alumno (con y sin asistencias) y el rechazo de un profesor a un alumno ajeno (después de T20) — Hecho cuando: cada RF listado tiene su resultado anotado como OK.

## Fase 5 — Docs y cierre
- [ ] T22 Actualizar `docs/03.20-Diagrama_Secuencia_Asistencia.md`, `docs/02.20-Diagrama_Estados.md` y `docs/04.20-Diagrama_Arquitectura.md` con el flujo real (resumen en el MS, consulta del Core al cerrar, LIBRE por asistencia) [sin test: docs] — Hecho cuando: los tres documentos reflejan el flujo implementado.
- [ ] T23 Validar todos los RF con `/sdd-validate` (después de T21) — Hecho cuando: los 26 RF están en ✅.
- [ ] T24 Borrar #37 de `docs/pendientes.md`, agregar el pendiente "Inasistencias justificadas (US-ASIS-04)", registrar en `MEMORY.md` dónde vive el cálculo y revisar `AGENTS.md` y `docs/constitution.md` [sin test: docs] — Hecho cuando: pendientes y `MEMORY.md` reflejan el estado final y los otros dos fueron revisados.
