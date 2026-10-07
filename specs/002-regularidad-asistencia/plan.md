# 002 — Plan técnico: Regularidad por asistencia (70 %)

- **Spec:** [`spec.md`](./spec.md)
- **Estado:** Aprobado (2026-10-06, incluye la llamada Core → `ms-asistencias` y `ASISTENCIAS_API_URL` en `backend/docker-compose.yml`)

## Resumen
El cálculo vive en `ms-asistencias`, el dueño de los datos: una función pura arma el resumen de una cursada (presentes, tardanzas, ausencias, total, porcentaje y estado REGULAR / NO_REGULAR / SIN_REGISTROS) y un endpoint nuevo, `GET /api/asistencias/resumen?cursadaIds=…`, lo devuelve para una o varias cursadas. El Core lo consulta al previsualizar y al cerrar una cursada (cliente nuevo `AsistenciasClient`, mismo patrón que `NotasClient`): sin registros rechaza el cierre, NO_REGULAR fuerza LIBRE y REGULAR sigue la regla actual de parciales. El frontend usa el mismo endpoint por el Gateway para la columna de la vista de comisión, el reporte por materia y ciclo (pantalla nueva) y la sección de asistencia del detalle del alumno.

## Chequeo de constitución
| Regla | Cumple | Nota |
|---|---|---|
| C1.1 / C1.2 Stack y dependencias | ✅ | Sin dependencias nuevas. |
| C1.3 Sin servicios nuevos | ✅ | |
| C1.4 Solo HTTP REST entre servicios | ✅ | Llamada nueva Core → `ms-asistencias` por HTTP. Suma acoplamiento a la deuda #22. **Requiere tu aprobación (endpoint entre servicios, AGENTS.md).** |
| C1.5 Reutilizar | ✅ | `NotasClient` como modelo, `RoleGuard`, `CondicionCursadaService`, `fetchGateway`, `getProfesorActual`, control de acceso de la vista de comisión. |
| C2.1 Capas | ✅ | Controller → service → repository en `ms-asistencias`; la regla de cierre queda en `CondicionCursadaService`. |
| C2.2 DTOs | ✅ | `ResumenAsistenciaResponse` (MS) y `ResumenAsistenciaDto` (Core), sin entidades expuestas. Nada nuevo en `commons`. |
| C2.3 Reglas en el backend | ✅ | El 70 % se calcula solo en `ms-asistencias`; el frontend muestra lo que devuelve. El filtro "profesor solo ve sus comisiones" (RF-22, RF-26) se aplica en Server Components, como hoy en la vista de comisión; ver riesgo. |
| C2.5 Frontend solo vía Gateway | ✅ | `/api/v1/asistencias/resumen` ya cae en la ruta `asistencias-api` del Gateway. |
| C2.6 Tipos espejo | ✅ | Tipo `ResumenAsistencia` en el frontend. |
| C3.1 / C3.2 Tests de servicio | ✅ | Ver estrategia de pruebas. |
| C3.3 Build y tests en verde | ✅ | `mvn test` en `ms-asistencias` y `backend`; `npm run build`. |
| C3.4 Deterministas | ✅ | El cálculo no depende de fechas ni de orden. |
| C3.5 E2E cross-service | ✅ | Toca Core + MS + frontend. |
| C4.1 Cada servicio su BD | ✅ | El Core no lee `db_asistencias`: pide el resumen por HTTP. |
| C4.4 Endpoint nuevo valida rol | ✅ | `RoleGuard.exigirRol(ADMIN, ADMINISTRATIVO, PROFESOR)`. |
| C4.7 Schema por Flyway | ✅ | Sin cambios de schema. |

## Archivos afectados
| Módulo | Archivo | Cambio | RF |
|---|---|---|---|
| ms-asistencias | `dto/ResumenAsistenciaResponse.java` | **Nuevo**: `cursadaId`, `presentes`, `tardanzas`, `ausentes`, `totalClases`, `porcentaje` (null sin registros), `estado`. | RF-01…RF-08 |
| ms-asistencias | `service/ResumenAsistenciaCalculator.java` | **Nuevo**: función pura `resumir(cursadaId, estados)`. | RF-01…RF-06, RF-08 |
| ms-asistencias | `repository/AsistenciaRepository.java` | `findByCursadaIdIn(List<Long>)`. | RF-01 |
| ms-asistencias | `service/AsistenciaService.java` | `resumir(List<Long> cursadaIds)`: agrupa por cursada y usa el calculador; una cursada sin filas devuelve SIN_REGISTROS. | RF-03, RF-08 |
| ms-asistencias | `controller/AsistenciaController.java` | `GET /api/asistencias/resumen?cursadaIds=1,2` con `RoleGuard`. | RF-07, RF-15, RF-19 |
| backend/core | `dto/response/ResumenAsistenciaDto.java` | **Nuevo** espejo del resumen. | RF-09…RF-13 |
| backend/core | `client/AsistenciasClient.java` | **Nuevo**, como `NotasClient` (`X-User-Roles: ADMIN`); ante error de red o 5xx lanza `503` con mensaje. | RF-13, RF-24 |
| backend/core | `dto/response/CondicionPreviewResponse.java` | Campos `porcentajeAsistencia`, `estadoAsistencia`, `motivoLibre` (`ASISTENCIA` / `PROMEDIO` / null). | RF-11, RF-23 |
| backend/core | `service/CondicionCursadaService.java` | `calcular` consulta la asistencia antes que los parciales; `cerrar` rechaza una cursada ya cerrada. | RF-09…RF-14, RF-23 |
| backend/api | `src/main/resources/application.yml` | `asistencias.api.url: ${ASISTENCIAS_API_URL:http://localhost:8083}`. | RF-09 |
| infra | `backend/docker-compose.yml` | `ASISTENCIAS_API_URL=http://ms-asistencias:8083` en `backend-app`. **Requiere tu aprobación (docker-compose, AGENTS.md).** | RF-09 |
| frontend | `types/ResumenAsistencia.ts` | **Nuevo** tipo espejo. | RF-07 |
| frontend | `lib/asistencia.ts` | **Nuevo**: `fetchResumenAsistencia(cursadaIds)` (Gateway) y `etiquetaAsistencia(resumen)` para mostrar "Sin registros". | RF-07, RF-08 |
| frontend | `app/dashboard/comisiones/[comisionId]/page.tsx` | Columna "Asistencia" con porcentaje y badge de estado por alumno; usa el control de acceso que ya existe. | RF-07, RF-08, RF-22 |
| frontend | `app/dashboard/comisiones/[comisionId]/page.tsx` | [IMPACTO: RF-27] La columna "Condición Final" muestra un badge "<condición> · cerrada" cuando `condicionFinal` no es null, y `CerrarCursadaBoton` se muestra solo en las cursadas abiertas. Sin cambios en el backend (el 409 de RF-14 queda como segunda capa). | RF-27 |
| frontend | `components/comisiones/cerrar-cursada-boton.tsx` | Antes de cerrar, muestra la vista previa (porcentaje, condición y motivo de LIBRE) en un diálogo de confirmación; errores del cierre con `toast.error`. | RF-11, RF-12, RF-23, RF-24 |
| frontend | `app/actions/cursada-actions.ts` | `previsualizarCierre(cursadaId)`; `cerrarCursada` devuelve el mensaje de error del backend. | RF-11, RF-24 |
| frontend | `app/dashboard/reportes/asistencia/page.tsx` | **Nueva** pantalla: formulario GET (materia, ciclo), tabla con comisión, porcentaje y estado, NO_REGULAR primero y marcados; "Sin registros". | RF-15, RF-16, RF-17, RF-21 |
| frontend | `components/layout/sidebar.tsx` | Ítem "Reporte de asistencia" para ADMIN y ADMINISTRATIVO. | RF-21 |
| frontend | `app/dashboard/alumnos/[alumnoId]/page.tsx` | Sección "Asistencia por cursada" (presentes, tardanzas, ausencias, porcentaje, estado, "Sin registros"); acceso de profesor solo si el alumno cursa en sus comisiones. | RF-18, RF-19, RF-20, RF-25, RF-26 |
| docs | `03.20-Diagrama_Secuencia_Asistencia.md`, `02.20-Diagrama_Estados.md`, `04.20-Diagrama_Arquitectura.md` | Flujo real: resumen en el MS, consulta del Core al cerrar, LIBRE por asistencia. | — |
| docs | `pendientes.md`, `MEMORY.md` | Cerrar #37, pendiente nuevo "inasistencias justificadas", decisión de dónde vive el cálculo. | — |

## Diseño
### Modelo de datos / migraciones
Sin cambios de schema. El resumen se calcula al vuelo desde la tabla de asistencias; la condición final ya se guarda en `Cursada`.

### Contratos (API)
**`GET /api/v1/asistencias/resumen?cursadaIds=12,13`** (nuevo; Gateway `asistencias-api` → `ms-asistencias` `/api/asistencias/resumen`)
- Roles: ADMIN, ADMINISTRATIVO, PROFESOR (`RoleGuard`); otro rol → 403.
- 200 → `ApiResponse<ResumenAsistenciaResponse>`, un elemento por cada `cursadaId` pedido, también los que no tienen filas:
  `{ cursadaId, presentes, tardanzas, ausentes, totalClases, porcentaje, estado }` con `estado ∈ {REGULAR, NO_REGULAR, SIN_REGISTROS}` y `porcentaje = null` en SIN_REGISTROS.
- 400 → `cursadaIds` vacío o no numérico.

**Core → `ms-asistencias`** (nuevo, interno): el mismo `GET /api/asistencias/resumen?cursadaIds={id}` directo por `ASISTENCIAS_API_URL`, con `X-User-Roles: ADMIN`.

**`GET /api/v1/cursadas/{id}/condicion-preview`** y **`POST /api/v1/cursadas/{id}/cerrar`** (existentes; cambia la respuesta y los errores)
- `CondicionPreviewResponse` suma `porcentajeAsistencia` (Double, nullable), `estadoAsistencia` (String) y `motivoLibre` (`ASISTENCIA` | `PROMEDIO` | null).
- 400 → "No hay asistencias registradas para este alumno en la comisión" (RF-12) o "Faltan parciales…" (como hoy, solo si la asistencia es REGULAR).
- 409 → "La cursada ya está cerrada" (RF-14, solo en `cerrar`).
- 503 → "No se pudieron obtener las asistencias. Intentá más tarde." (RF-13, RF-24).

### Lógica (funciones puras y pseudocódigo)
```text
// ms-asistencias: ResumenAsistenciaCalculator
resumir(cursadaId, estados):
  presentes = cantidad(estados == PRESENTE)
  tardanzas = cantidad(estados ∈ {TARDANZA, TARDE})        // RF-02 (TARDE: valor viejo del front)
  ausentes  = cantidad(estados == AUSENTE)
  total     = presentes + tardanzas + ausentes               // RF-03: solo fechas con marca
  si total == 0 → { ..., porcentaje: null, estado: SIN_REGISTROS }       // RF-08
  asistidas = presentes + tardanzas
  porcentaje = asistidas * 100.0 / total                     // RF-01 (para mostrar)
  regular = asistidas * 100 >= 70 * total                    // RF-04..06: entero, sin redondeo
  devolver { ..., porcentaje, estado: regular ? REGULAR : NO_REGULAR }

// Core: CondicionCursadaService.calcular(cursadaId)
cursada = buscar o 404
asistencia = asistenciasClient.resumen(cursadaId)          // falla → 503 (RF-13, RF-24)
si asistencia.estado == SIN_REGISTROS → 400 "No hay asistencias…"     // RF-12
parciales = notasClient.obtenerPorCursada(cursadaId)
si asistencia.estado == NO_REGULAR:
  promedio = parciales.size == 3 ? promedio(parciales) : null
  devolver { condicion: LIBRE, motivoLibre: ASISTENCIA, promedio, notaCierre: promedio, porcentaje… }  // RF-09, RF-23
si parciales.size != 3 → 400 "Faltan parciales…"            // como hoy
condicion = reglaActual(promedio, modalidad)                // RF-10
motivoLibre = condicion == LIBRE ? PROMEDIO : null          // RF-23
devolver { condicion, motivoLibre, promedio, porcentaje… } // RF-11

// Core: cerrar(cursadaId)
si cursada.condicionFinal != null → 409 "La cursada ya está cerrada"   // RF-14
preview = calcular(cursadaId); guardar condición y nota
```

## Decisiones
| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| El cálculo vive en `ms-asistencias` y se expone como resumen. | Calcularlo en el Core trayendo las asistencias crudas, o en el frontend. | `ms-asistencias` es el dueño de los datos (C4.1); un solo lugar para la regla (C2.3); el Core y el frontend reciben el mismo resultado. |
| Un endpoint con `cursadaIds` en lista. | Un endpoint por cursada. | El reporte y la vista de comisión piden muchas cursadas a la vez; evita N llamadas. El Core lo usa con una sola. |
| La asistencia se evalúa antes que los parciales al cerrar. | Exigir los 3 parciales también para quien está NO_REGULAR. | RF-09 dice "cualquiera sea su promedio": un alumno que dejó de asistir y no rindió parciales debe poder cerrarse como LIBRE. |
| `cerrar` rechaza una cursada ya cerrada (409). | Permitir recerrar. | RF-14: si se pudiera recerrar, corregir una asistencia cambiaría la condición. La corrección manual sigue disponible con "Editar cursada". |
| Comparación con enteros (`asistidas*100 >= 70*total`). | Comparar el `double` redondeado. | RF-06: evita errores de coma flotante en el borde del 70 %. |
| El filtro "profesor solo sus comisiones" se aplica en Server Components (y el endpoint exige rol). | Que `ms-asistencias` le pregunte al Core qué comisiones dicta cada profesor. | Es el mismo control que ya usa la vista de comisión; hacerlo en el MS agregaría otra llamada MS → Core (más acoplamiento, deuda #22). Proyecto local (ver riesgo). |
| Reporte como Server Component con formulario GET (`?materiaPlanId=&cicloId=`). | Server Action o componente cliente. | Es una lectura (C2.4); la URL queda compartible y no hace falta estado en el cliente. |

## Estrategia de pruebas
| RF | Tipo | Test |
|---|---|---|
| RF-01, RF-02 | Unitario | `ResumenAsistenciaCalculatorTest.cuentaTardanzasComoPresentes`, `calculaPorcentajeSobreClasesConMarca` |
| RF-03 | Unitario | `AsistenciaServiceTest.resumir_cuentaSoloLasFechasConMarcaDelAlumno` |
| RF-04, RF-05, RF-06 | Unitario | `ResumenAsistenciaCalculatorTest.setentaExactoEsRegular`, `sesentaYNueveConNueveEsNoRegular` (7/10 y 699/1000) |
| RF-07, RF-08, RF-22 | Unitario + E2E | `ResumenAsistenciaCalculatorTest.sinMarcasEsSinRegistros`; `AsistenciaServiceTest.resumir_cursadaSinFilasDevuelveSinRegistros`; navegador: columna en la comisión, "Sin registros", profesor ajeno sin acceso. |
| RF-09 | Unitario | `CondicionCursadaServiceTest.calcular_noRegularQuedaLibreAunConPromedioAlto` y `…_aunSinParciales` |
| RF-10 | Unitario | `CondicionCursadaServiceTest.calcular_regularSigueReglaDeParciales` (los casos existentes, con asistencia REGULAR mockeada) |
| RF-11, RF-23 | Unitario + E2E | `calcular_informaPorcentajeYMotivoLibre`; navegador: diálogo de cierre. |
| RF-12 | Unitario | `calcular_sinRegistrosRechazaCierre` |
| RF-13, RF-24 | Unitario + E2E | `calcular_siFallaElServicioDeAsistenciasDevuelve503`; E2E con `ms-asistencias` apagado: toast con el mensaje. |
| RF-14 | Unitario | `cerrar_cursadaYaCerradaDevuelve409` |
| RF-27 | E2E | [IMPACTO: RF-27] Navegador: cursada cerrada con badge "cerrada" y sin botón; cursada abierta con botón. |
| RF-15, RF-16, RF-17 | E2E | Reporte con datos (NO_REGULAR primero y marcados) y sin datos ("Sin registros"). |
| RF-18, RF-19, RF-20 | E2E | Detalle de alumno con cursadas y sin asistencias. |
| RF-21 | E2E | Profesor sin el ítem del menú; acceso directo a la URL muestra "No tenés permiso". |
| RF-25 | Unitario + E2E | `AsistenciaControllerTest` o curl: rol sin permiso → 403. |
| RF-26 | E2E | Profesor que abre un alumno de otra comisión → rechazo. |

## Riesgos
- **RF-22 y RF-26 se controlan en el servidor de Next, no en `ms-asistencias`:** un profesor que llame directo al Gateway con su token podría pedir el resumen de cualquier cursada. Es el mismo nivel de control que hoy tienen las asistencias y las notas; alcanza para el escenario (proyecto local). Registrado como deuda #42.
- **Cambio de comportamiento en el cierre:** las cursadas sin asistencias ya no se pueden cerrar (RF-12). Con los datos del seeder no debería pasar, pero conviene saberlo al probar.
- **Valor `TARDE`:** `estado-asistencia-toggle.tsx` y el tipo viejo del frontend usan `TARDE`, mientras que la toma de asistencia guarda `TARDANZA`. El calculador acepta ambos para no perder datos.
