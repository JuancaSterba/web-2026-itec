# **? PROYECTO FINAL**

# **BACKOFFICE ACADÉMICO – ITEC N°1**

? **BACKLOG DE USER STORIES**

### Convenciones

* Roles/Actores:
  + ADM = Administrativo
  + ALU = Alumno
  + DOC = Docente
  + SYS = Sistema (automático)
* Estados sugeridos: ACTIVO / INACTIVO; REGULAR / NO REGULAR; APROBADO / DESAPROBADO.
* Criterios de aceptación: formato Gherkin.
* Casos de test: ID + pasos + resultado esperado.

##

## **? US-AUTH-01 — Iniciar sesión (EPIC-AUTH)**

| **User Story: EPIC-AUTH — Gestión de Acceso** |  |
| --- | --- |
| **Como** usuario autorizado (ADM - DOC- ALU)  **Quiero** iniciar sesión con usuario y contraseña  **Para** acceder a las funciones habilitadas según mi rol | |
| **Precondiciones**  • Existe un usuario registrado con rol válido.  • El usuario está ACTIVO. | |
| **Reglas / Validaciones**  • Contraseñas almacenadas de forma segura (hash/cript).  • Validar campos obligatorios no vacíos.  • Bloquear acceso si usuario INACTIVO.  • Aplicar permisos según rol. | |
| **Criterios de Aceptación (Gherkin)**    **Escenario 1 — Login exitoso**  DADO QUE el usuario ingresa credenciales válidas  CUANDO confirma el inicio de sesión  ENTONCES el sistema autentica  Y habilita funcionalidades según rol    **Escenario 2 — Credenciales inválidas**  DADO QUE el usuario ingresa datos incorrectos  CUANDO confirma el inicio de sesión  ENTONCES el sistema rechaza el acceso  Y muestra un mensaje de error claro    **Escenario 3 — Usuario inactivo**  DADO QUE el usuario está INACTIVO  CUANDO intenta iniciar sesión  ENTONCES el sistema rechaza el acceso  Y muestra “Usuario inactivo o sin permisos” | |
| **Casos de Test**  TC-AUTH-01: Login ADM válido ? Acceso y menú administrativo.  TC-AUTH-02: Login ALU válido ? Acceso y menú alumno.  TC-AUTH-03: Login DOC válido ? Acceso y menú docente.  TC-AUTH-04: Password incorrecto ? Error, no acceso.  TC-AUTH-05: Usuario inexistente ? Error, no acceso.  TC-AUTH-06: Usuario INACTIVO ? Acceso denegado. | |
| **Contrato (opcional si API)**  POST /api/v1/auth/login ? 200 / 401 / 403 | |
| **Resultado Esperado**  El usuario accede solo a funciones permitidas por su rol. | |

**??? EPIC-ALU — Gestión de Alumnos**

| **User Story: US-ALU-01 — Crear alumno** |
| --- |
| **Como** Administrativo  **Quiero** registrar un alumno  **Para** incorporarlo al sistema académico |
| **Prioridad:** Alta |
| **Dependencia:** US-AUTH-01 (login) |
| **Precondiciones**  • ADM autenticado.  • Módulo Alumnos disponible. |
| **Reglas / Validaciones**  • DNI único (no duplicado).  • Email con formato válido.  • Teléfono con formato válido (regla simple).  • Estado inicial del alumno: ACTIVO.  • Campos obligatorios: Nombre, Apellido, DNI, Email, Teléfono. |
| **Criterios de Aceptación (Gherkin)**    **Escenario 1 — Alta exitosa**  DADO QUE el ADM ingresa datos válidos  CUANDO confirma el alta  ENTONCES el sistema crea el alumno ACTIVO  Y queda disponible para inscripciones y reportes    **Escenario 2 — DNI duplicado**  DADO QUE ya existe un alumno con el DNI ingresado  CUANDO confirma el alta  ENTONCES el sistema rechaza la operación  Y muestra “DNI ya registrado”    **Escenario 3 — Datos inválidos**  DADO QUE el ADM ingresa un email inválido o campos vacíos  CUANDO confirma el alta  ENTONCES el sistema rechaza la operación  Y muestra los motivos de validación |
| **Casos de Test**  TC-ALU-01: Alta OK ? alumno ACTIVO persistido.  TC-ALU-02: DNI duplicado ? error y no se crea.  TC-ALU-03: Email inválido ? error.  TC-ALU-04: Campo obligatorio vacío ? error. |
| **Contrato (opcional si API)**  POST /api/v1/alumnos ? 201 / 400 / 409 |
| **Resultado Esperado**  Alumno registrado y visible en consultas/listados. |

## **US-ALU-02 — Consultar alumno por DNI**

| **User Story: US-ALU-02 — Consultar alumno** |
| --- |
| **Como** Administrativo  **Quiero** buscar un alumno por DNI  **Para** visualizar su información y estado académico |
| **Prioridad:** Alta |
| **Dependencia:** US-AUTH-01, US-ALU-01 |
| **Precondiciones**  • ADM autenticado. |
| **Reglas / Validaciones**  • Si no existe el DNI ? informar “no encontrado”. |
| **Criterios de Aceptación (Gherkin)**    **Escenario 1 — Consulta exitosa**  DADO QUE existe un alumno con DNI X  CUANDO el ADM lo consulta  ENTONCES el sistema muestra datos personales y estado    **Escenario 2 — No existe**  DADO QUE no existe alumno con DNI X  CUANDO el ADM consulta  ENTONCES el sistema muestra “Alumno no encontrado” |
| **Casos de Test**  TC-ALU-05: DNI existente ? muestra datos.  TC-ALU-06: DNI inexistente ? “no encontrado”. |
| **Contrato (opcional si API)**  GET /api/v1/alumnos/{dni} ? 200 / 404 |
| **Resultado Esperado**  Consulta clara, completa y sin ambigüedades. |

## **US-ALU-03 — Modificar alumno**

| **User Story: US-ALU-03 — Modificar alumno** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** modificar datos de un alumno  **Para** mantener información actualizada |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-AUTH-01, US-ALU-01 |  |
| **Precondiciones**  • ADM autenticado.  • Alumno existente. |  |
| **Reglas / Validaciones**  • Validar email/teléfono.  • (Recomendado) DNI no editable; si se permite, debe seguir siendo único. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Modificación exitosa**  DADO QUE el alumno existe  CUANDO el ADM guarda datos válidos  ENTONCES el sistema actualiza la información  Y registra fecha de última modificación    **Escenario — Alumno inexistente**  DADO QUE no existe el alumno  CUANDO el ADM intenta modificar  ENTONCES el sistema informa “no encontrado” |  |
| **Casos de Test**  TC-ALU-07: Update OK.  TC-ALU-08: Email inválido ? error.  TC-ALU-09: Alumno inexistente ? no encontrado. |  |
| **Contrato (opcional si API)**  PUT /api/v1/alumnos/{dni} ? 200 / 400 / 404 |  |
| **Resultado Esperado**  Datos del alumno actualizados correctamente. |  |

## **US-ALU-04 — Baja lógica alumno**

| **User Story: US-ALU-04 — Baja lógica alumno** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** dar de baja lógica a un alumno  **Para** impedir nuevas inscripciones sin perder historial |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-AUTH-01, US-ALU-01 |  |
| **Precondiciones**  • ADM autenticado.  • Alumno existente ACTIVO. |  |
| **Reglas / Validaciones**  • Baja lógica: estado pasa a INACTIVO.  • No se elimina historial académico (asistencias/notas/inscripciones).  • Alumno INACTIVO no puede inscribirse a nuevas materias. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Baja lógica exitosa**  DADO alumno ACTIVO  CUANDO el ADM confirma la baja  ENTONCES el alumno pasa a INACTIVO  Y el sistema bloquea nuevas inscripciones    **Escenario — Alumno inexistente**  DADO alumno inexistente  CUANDO el ADM intenta dar de baja  ENTONCES el sistema informa “no encontrado” |  |
| **Casos de Test**  TC-ALU-10: Baja OK ? INACTIVO.  TC-ALU-11: Inexistente ? no encontrado.  TC-ALU-12: Intento de inscripción de INACTIVO ? bloqueado. |  |
| **Contrato (opcional si API)**  DELETE /api/v1/alumnos/{dni} ? 204 / 404 |  |
| **Resultado Esperado**  Alumno desactivado conservando historial y trazabilidad. |  |

# **??? EPIC-PROF — Gestión de Profesores**

## **US-PROF-01 — Crear profesor**

| **User Story: US-PROF-01 — Crear profesor** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** registrar un profesor  **Para** asignarlo a materias |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-AUTH-01 |  |
| **Precondiciones**  • ADM autenticado. |  |
| **Reglas / Validaciones**  • DNI único.  • Email válido.  • Estado inicial ACTIVO. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Alta exitosa**  DADO datos válidos  CUANDO confirmo el alta  ENTONCES se crea profesor ACTIVO    **Escenario — DNI duplicado**  DADO DNI ya registrado  CUANDO confirmo el alta  ENTONCES se rechaza con mensaje “DNI ya registrado” |  |
| **Casos de Test**  TC-PROF-01: Alta OK.  TC-PROF-02: DNI duplicado ? error.  TC-PROF-03: Email inválido ? error. |  |
| **Contrato (opcional si API)**  POST /api/v1/profesores ? 201 / 400 / 409 |  |
| **Resultado Esperado**  Profesor creado y disponible para asignación. |  |

## **US-PROF-02 — Modificar profesor**

| **User Story: US-PROF-02 — Modificar profesor** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** modificar datos del profesor  **Para** mantener información actualizada |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-AUTH-01, US-PROF-01 |  |
| **Precondiciones**  • ADM autenticado.  • Profesor existente. |  |
| **Reglas / Validaciones**  • Email válido.  • DNI no editable (recomendado). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Modificación exitosa**  DADO profesor existente  CUANDO guardo cambios válidos  ENTONCES se actualizan los datos    **Escenario — No existe**  DADO profesor inexistente  CUANDO intento modificar  ENTONCES se informa “no encontrado” |  |
| **Casos de Test**  TC-PROF-04: Update OK.  TC-PROF-05: Inexistente ? no encontrado. |  |
| **Contrato (opcional si API)**  PUT /api/v1/profesores/{id} ? 200 / 400 / 404 |  |
| **Resultado Esperado**  Profesor actualizado sin afectar historial. |  |

## **US-PROF-03 — Baja lógica profesor**

| **User Story: US-PROF-03 — Baja lógica profesor** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** desactivar un profesor  **Para** impedir nuevas asignaciones sin borrar historial |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-AUTH-01, US-PROF-01 |  |
| **Precondiciones**  • Profesor existente ACTIVO. |  |
| **Reglas / Validaciones**  • Baja lógica: estado INACTIVO.  • No se elimina historial.  • Profesor INACTIVO no puede asignarse a nuevas materias. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Baja lógica exitosa**  DADO profesor ACTIVO  CUANDO confirmo la baja  ENTONCES pasa a INACTIVO  Y el sistema bloquea nuevas asignaciones |  |
| **Casos de Test**  TC-PROF-06: Baja OK.  TC-PROF-07: Intento asignar INACTIVO ? bloqueado. |  |
| **Contrato (opcional si API)**  DELETE /api/v1/profesores/{id} ? 204 / 404 |  |
| **Resultado Esperado**  Profesor desactivado con integridad de datos. |  |

## **US-PROF-04 — Asignar profesor a materia**

| **User Story: US-PROF-04 — Asignar profesor a materia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** asignar un profesor a una materia  **Para** definir quién la dicta |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-PROF-01, US-MAT-01 |  |
| **Precondiciones**  • Profesor ACTIVO.  • Materia ACTIVA. |  |
| **Reglas / Validaciones**  • No asignar profesor INACTIVO.  • (Recomendado) Definir profesor “responsable” (1) y co-docentes (0..n). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Asignación exitosa**  DADO profesor ACTIVO y materia ACTIVA  CUANDO el ADM asigna el profesor  ENTONCES se registra la asignación  Y se visualiza en la ficha de la materia    **Escenario — Profesor inactivo**  DADO profesor INACTIVO  CUANDO intento asignar  ENTONCES el sistema rechaza la operación |  |
| **Casos de Test**  TC-PROF-08: Asignación OK.  TC-PROF-09: Profesor INACTIVO ? error.  TC-PROF-10: Materia INACTIVA ? error. |  |
| **Contrato (opcional si API)**  POST /api/v1/materias/{idMateria}/profesores/{idProfesor} ? 200 / 400 / 404 |  |
| **Resultado Esperado**  Materia correctamente asociada a profesor(es). |  |

# **? EPIC-MAT — Gestión de Materias y Correlativas**

## **US-MAT-01 — Crear materia**

| **User Story: US-MAT-01 — Crear materia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** crear una materia  **Para** incorporarla a la oferta académica |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-AUTH-01 |  |
| **Precondiciones**  • ADM autenticado. |  |
| **Reglas / Validaciones**  • Código/Nombre obligatorio.  • Código único (si se usa).  • Estado inicial ACTIVO. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Alta exitosa**  DADO datos válidos  CUANDO creo la materia  ENTONCES la materia queda ACTIVA y disponible |  |
| **Casos de Test**  TC-MAT-01: Alta OK.  TC-MAT-02: Código duplicado ? error. |  |
| **Contrato (opcional si API)**  POST /api/v1/materias ? 201 / 400 / 409 |  |
| **Resultado Esperado**  Materia creada y visible. |  |

## **US-MAT-02 — Modificar materia**

| **User Story: US-MAT-02 — Modificar materia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** modificar una materia  **Para** corregir o actualizar información |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-MAT-01 |  |
| **Precondiciones**  • Materia existente. |  |
| **Reglas / Validaciones**  • Campos obligatorios no vacíos.  • Si cambia código, debe seguir siendo único. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Modificación exitosa**  DADO materia existente  CUANDO guardo cambios válidos  ENTONCES se actualiza la materia |  |
| **Casos de Test**  TC-MAT-03: Update OK.  TC-MAT-04: Inexistente ? no encontrado. |  |
| **Contrato (opcional si API)**  PUT /api/v1/materias/{id} ? 200 / 400 / 404 |  |
| **Resultado Esperado**  Materia actualizada correctamente. |  |

## **US-MAT-03 — Baja lógica materia**

| **User Story: US-MAT-03 — Baja lógica materia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** desactivar una materia  **Para** impedir nuevas inscripciones conservando historial |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-MAT-01 |  |
| **Precondiciones**  • Materia existente ACTIVA. |  |
| **Reglas / Validaciones**  • Baja lógica: pasa a INACTIVA.  • Materia INACTIVA no permite nuevas inscripciones. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Baja lógica exitosa**  DADO materia ACTIVA  CUANDO el ADM confirma la baja  ENTONCES la materia pasa a INACTIVA  Y se bloquean nuevas inscripciones |  |
| **Casos de Test**  TC-MAT-05: Baja OK.  TC-MAT-06: Inscripción a INACTIVA ? bloqueado. |  |
| **Contrato (opcional si API)**  DELETE /api/v1/materias/{id} ? 204 / 404 |  |
| **Resultado Esperado**  Materia desactivada sin perder historial. |  |

## **US-MAT-04 — Definir correlativas**

| **User Story: US-MAT-04 — Definir correlativas** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** definir correlativas para una materia  **Para** establecer prerrequisitos académicos |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-MAT-01 |  |
| **Precondiciones**  • Materias involucradas existen. |  |
| **Reglas / Validaciones**  • Una materia puede tener múltiples correlativas.  • No se permite correlativa a sí misma.  • No se permiten ciclos (A?B y B?A, o ciclos más largos). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Correlativa válida**  DADO materias A y B existentes  CUANDO defino B como correlativa de A  ENTONCES el sistema registra el prerrequisito    **Escenario — Ciclo**  DADO que la correlativa genera ciclo  CUANDO intento guardarla  ENTONCES el sistema rechaza e informa el motivo |  |
| **Casos de Test**  TC-MAT-07: Correlativa OK.  TC-MAT-08: Correlativa a sí misma ? error.  TC-MAT-09: Ciclo detectado ? error. |  |
| **Contrato (opcional si API)**  POST /api/v1/materias/{id}/correlativas/{idCorrelativa} ? 200 / 400 |  |
| **Resultado Esperado**  Correlativas persistidas y usadas en validaciones. |  |

# **? EPIC-INS — Inscripción a Materias**

## **US-INS-01 — Inscribir alumno a materia**

| **User Story: US-INS-01 — Inscribir alumno** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** inscribir un alumno en una materia  **Para** registrar su cursada |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-ALU-01, US-MAT-01, US-MAT-04 |  |
| **Precondiciones**  • Alumno ACTIVO.  • Materia ACTIVA. |  |
| **Reglas / Validaciones**  • No duplicar inscripción.  • Validar correlativas aprobadas (si existen). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Inscripción exitosa**  DADO alumno ACTIVO y materia ACTIVA  Y correlativas aprobadas  CUANDO el ADM inscribe  ENTONCES el sistema registra la inscripción    **Escenario — Correlativas faltantes**  DADO que faltan correlativas aprobadas  CUANDO intento inscribir  ENTONCES el sistema rechaza e informa cuáles faltan |  |
| **Casos de Test**  TC-INS-01: Inscripción OK.  TC-INS-02: Duplicada ? error.  TC-INS-03: Correlativas faltantes ? error detallado.  TC-INS-04: Alumno INACTIVO ? bloqueado. |  |
| **Contrato (opcional si API)**  POST /api/v1/inscripciones ? 201 / 400 / 409 |  |
| **Resultado Esperado**  Inscripción creada con validaciones correctas. |  |

# **? EPIC-ASIS — Asistencias y Regularidad**

## **US-ASIS-01 — Registrar asistencia**

| **User Story: US-ASIS-01 — Registrar asistencia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Docente  **Quiero** registrar asistencia por clase  **Para** controlar regularidad del alumno |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-AUTH-01, US-PROF-04, US-INS-01 |  |
| **Precondiciones**  • DOC autenticado.  • DOC asignado a la materia.  • Alumnos inscriptos. |  |
| **Reglas / Validaciones**  • Registrar por clase/fecha y por alumno.  • No permitir registrar asistencia si DOC no está asignado. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Registro exitoso**  DADO una clase definida para la materia  CUANDO el DOC marca presentes/ausentes  ENTONCES el sistema guarda la asistencia por alumno    **Escenario — Docente no asignado**  DADO DOC no asignado a la materia  CUANDO intenta registrar asistencia  ENTONCES el sistema deniega la acción |  |
| **Casos de Test**  TC-ASIS-01: Registro OK.  TC-ASIS-02: DOC no asignado ? denegado. |  |
| **Contrato (opcional si API)**  POST /api/v1/asistencias ? 201 / 403 / 400 |  |
| **Resultado Esperado**  Asistencias registradas y disponibles para reportes. |  |

## **US-ASIS-02 — Calcular regularidad automática**

| **User Story: US-ASIS-02 — Calcular regularidad** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Sistema  **Quiero** calcular porcentaje de asistencia  **Para** actualizar condición REGULAR/NO\_REGULAR |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-ASIS-01 |  |
| **Precondiciones**  • Existen asistencias registradas para la materia. |  |
| **Reglas / Validaciones**  • Regular si asistencia ? 70%.  • Calcular sobre total de clases registradas. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Regular**  DADO alumno con asistencia 70% o más  CUANDO el sistema recalcula  ENTONCES estado pasa a REGULAR    **Escenario — No regular**  DADO alumno con asistencia menor a 70%  CUANDO el sistema recalcula  ENTONCES estado pasa a NO\_REGULAR |  |
| **Casos de Test**  TC-ASIS-03: 70% exacto ? REGULAR.  TC-ASIS-04: 69.9% ? NO\_REGULAR. |  |
| **Resultado Esperado**  Estados de regularidad consistentes con la regla del 70%. |  |

# **? EPIC-CAL — Calificaciones**

## **US-CAL-01 — Registrar nota parcial**

| **User Story: US-CAL-01 — Registrar nota parcial** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Docente  **Quiero** registrar notas parciales  **Para** evaluar el desempeño durante la cursada |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-AUTH-01, US-INS-01 |  |
| **Precondiciones**  • Alumno inscripto en materia.  • DOC asignado a materia. |  |
| **Reglas / Validaciones**  • Nota dentro de rango (definir escala: 0..10). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Carga exitosa**  DADO alumno inscripto  CUANDO el DOC registra una nota válida  ENTONCES el sistema guarda la calificación    **Escenario — Nota inválida**  DADO una nota fuera de rango  CUANDO intento guardar  ENTONCES el sistema rechaza y explica el error |  |
| **Casos de Test**  TC-CAL-01: Parcial OK.  TC-CAL-02: Nota fuera de rango ? error. |  |
| **Resultado Esperado**  Parciales guardados y consultables. |  |

## **US-CAL-02 — Registrar nota final**

| **User Story: US-CAL-02 — Registrar nota final** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Docente  **Quiero** registrar la nota final  **Para** determinar aprobación de la materia |  |
| **Prioridad:** Alta |  |
| **Dependencia:** US-ASIS-02, US-MAT-04 |  |
| **Precondiciones**  • Alumno inscripto.  • Alumno REGULAR (?70%).  • Correlativas aprobadas (si aplica). |  |
| **Reglas / Validaciones**  • Nota final en escala 0..10.  • Si nota final ? 6 ? APROBADO.  • Si nota final < 6 ? DESAPROBADO.  • Si NO\_REGULAR ? no permitir registrar final. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Final aprobado**  DADO alumno REGULAR y correlativas aprobadas  CUANDO registro nota final ? 6  ENTONCES el sistema marca APROBADO    **Escenario — Final desaprobado**  DADO alumno REGULAR  CUANDO registro nota final < 6  ENTONCES el sistema marca DESAPROBADO    **Escenario — Alumno no regular**  DADO alumno NO\_REGULAR  CUANDO intento registrar final  ENTONCES el sistema rechaza y muestra “Alumno no regular” |  |
| **Casos de Test**  TC-CAL-03: Final 6 ? APROBADO.  TC-CAL-04: Final 5 ? DESAPROBADO.  TC-CAL-05: NO\_REGULAR ? rechazo. |  |
| **Resultado Esperado**  Estado final consistente y validado. |  |

# **? EPIC-REP — Reportes e Indicadores**

## **US-REP-01 — Reporte de asistencia por materia**

| **User Story: US-REP-01 — Reporte de asistencia** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** generar reporte de asistencia por materia  **Para** detectar alumnos en riesgo de perder regularidad |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-ASIS-01, US-ASIS-02 |  |
| **Precondiciones**  • Existen asistencias registradas o se debe informar “sin datos”. |  |
| **Reglas / Validaciones**  • Mostrar % por alumno y estado REGULAR/NO\_REGULAR. |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Con datos**  DADO materia con asistencias  CUANDO genero el reporte  ENTONCES el sistema lista alumnos con porcentaje y estado    **Escenario — Sin datos**  DADO materia sin asistencias  CUANDO genero el reporte  ENTONCES el sistema informa “Sin registros” |  |
| **Casos de Test**  TC-REP-01: Reporte con datos OK.  TC-REP-02: Reporte sin datos ? “Sin registros”. |  |
| **Resultado Esperado**  Reporte claro para toma de decisiones. |  |

## **US-REP-02 — Reporte de rendimiento por alumno**

| **User Story: US-REP-02 — Reporte de rendimiento** | **ESTIMACIÓN** |
| --- | --- |
| **Como** Administrativo  **Quiero** ver reporte de rendimiento de un alumno  **Para** evaluar su desempeño académico |  |
| **Prioridad:** Media |  |
| **Dependencia:** US-CAL-01, US-CAL-02 |  |
| **Precondiciones**  • Alumno existe. |  |
| **Reglas / Validaciones**  • Mostrar notas parciales, final, estado y promedio (si aplica). |  |
| **Criterios de Aceptación (Gherkin)**    **Escenario — Con notas**  DADO alumno con calificaciones  CUANDO genero el reporte  ENTONCES el sistema muestra calificaciones y estados    **Escenario — Sin notas**  DADO alumno sin calificaciones  CUANDO genero el reporte  ENTONCES el sistema informa “Sin calificaciones registradas” |  |
| **Casos de Test**  TC-REP-03: Reporte con notas OK.  TC-REP-04: Reporte sin notas ? mensaje “Sin calificaciones”. |  |
| **Resultado Esperado**  Resumen del desempeño del alumno. |  |
