# **? PROYECTO FINAL**

# **BACKOFFICE ACADÉMICO – ITEC N°1**

? **BACKLOG DE USER STORIES**

# **ANEXO — Requerimientos de Asistencia y Carga de Notas**

Complementario al Backoffice Académico ITEC N°1

# **? EPIC-ASIS — Gestión de Asistencia**

## **US-ASIS-03 — Consultar asistencia por alumno**

**Como** Docente / Administrativo
 **Quiero** consultar asistencias de un alumno
 **Para** visualizar presentismo e historial.

### **Reglas**

* Mostrar presentes, ausentes, justificadas.
* Calcular porcentaje acumulado.
* Mostrar estado:
  + REGULAR (>=70%)
  + NO\_REGULAR (<70%)

### **API**

GET /api/v1/asistencias/alumnos/{idAlumno}

### **Casos de prueba**

* TC-ASIS-05 consulta exitosa
* TC-ASIS-06 alumno sin asistencias
* TC-ASIS-07 cálculo de regularidad correcto

## **US-ASIS-04 — Justificar inasistencia**

Como Docente / Administrativo
 Quiero registrar inasistencias justificadas
 Para no penalizar al alumno.

Reglas:

* Motivo obligatorio
* Adjuntar certificado opcional
* No computar como ausencia común

Estados:

* PRESENTE
* AUSENTE
* JUSTIFICADA

## **US-ASIS-05 — Cierre de asistencia por comisión**

Como Sistema
 Quiero cerrar asistencias de cursada
 Para congelar cálculo de regularidad.

Validaciones:

* No modificar asistencias luego del cierre (salvo admin)
* Generar regularidad final

# **? EPIC-CAL — Gestión de Notas**

## **Modelo sugerido**

Tipos de evaluación:

* Parcial 1
* Parcial 2
* Recuperatorio
* Trabajo práctico
* Final

Entidad sugerida:

Calificacion

- id

- alumnoId

- materiaId

- tipoEvaluacion

- nota

- fecha

- observaciones

- docenteId

## **US-CAL-03 — Modificar nota**

Como Docente
 Quiero corregir una nota cargada
 Para subsanar errores.

Reglas:

* Registrar auditoría:
  + nota anterior
  + nota nueva
  + usuario
  + fecha

API

PUT /api/v1/calificaciones/{id}

## **US-CAL-04 — Registrar recuperatorio**

Como Docente
 Quiero cargar recuperatorios
 Para reevaluar alumnos desaprobados.

Reglas:

* Solo si parcial desaprobado
* Recuperatorio reemplaza o promedia (configurable)

Casos:

* recuperatorio aprobado
* recuperatorio desaprobado

## **US-CAL-05 — Cálculo automático de promedio**

Como Sistema
 Quiero calcular promedio automático
 Para mostrar rendimiento académico.

Fórmula configurable:

Promedio = ? notas / cantidad

Estados:

* PROMOCIONADO
* REGULAR
* DESAPROBADO

## **US-CAL-06 — Cierre de acta final**

Como Docente
 Quiero cerrar acta de notas
 Para oficializar calificaciones.

Validaciones:

* Todos los alumnos con nota final
* Firma digital docente (opcional)
* Acta no editable luego del cierre

API

POST /api/v1/actas/cerrar

# **? Reportes adicionales**

## **Reporte de alumnos en riesgo**

Criterio:

* asistencia <70%
* promedio <6

Alertas:

* Riesgo académico
* Riesgo de pérdida de regularidad

## **Reporte libro de actas**

Debe listar:

* alumno
* parciales
* recuperatorios
* final
* condición

Exportables:

* PDF
* Excel
* CSV

# **? Reglas de Seguridad**

Solo DOC asignado puede:

? cargar asistencia
 ? cargar notas
 ? modificar notas propias

Solo ADM puede:

? desbloquear actas cerradas
 ? correcciones extraordinarias

# **Eventos de auditoría (muy importante)**

Registrar:

* quién cargó asistencia
* quién modificó notas
* cuándo
* valores anteriores

Tabla sugerida:

AuditLog

- accion

- usuario

- entidad

- valorAnterior

- valorNuevo

- fecha

# **Casos de negocio importantes**

## **Regularidad**

Asistencia >=70% => Regular

Asistencia <70% => No regular

## **Aprobación**

Nota >=6 -> Aprobado

Nota <6 -> Desaprobado

# **Futuro (opcional)**

* Carga masiva de notas por Excel
* QR para asistencia
* Firma digital de actas
* Notificaciones automáticas a alumnos

## **EPICS agregadas**

* EPIC-ASIS ampliada
* EPIC-CAL ampliada
* EPIC-AUD auditoría académica

Esto además te deja listo para después modelar entidades como:

* Asistencia
* Calificacion
* Acta
* Regularidad
* AuditLog
