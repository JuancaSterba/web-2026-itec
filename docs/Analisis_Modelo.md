# Análisis del Modelo de Dominio y Puntos a Tener en Cuenta

El modelo relacional existente en el backend (`backend/core/src/main/java...`) es sólido y modular. Cubre los dominios requeridos por la documentación, incluyendo gestión de usuarios, alumnos, profesores, estructura académica y evaluación.

No obstante, previo al desarrollo de la lógica de negocio, se deben revisar y confirmar los siguientes puntos en el código Java para asegurar que cumplan al 100% con los requerimientos documentados:

## 1. Validación de Correlativas
- **Requisito:** El sistema debe aplicar reglas académicas de materias correlativas.
- **Acción sugerida:** Verificar que la entidad `Materia` o `PlanEstudio` contenga una relación recursiva (por ejemplo, `List<Materia> correlativas` con una relación `@ManyToMany` en JPA) o una entidad intermedia que guarde qué materias son pre-requisito de otras. Si no existe, se deberá crear.

## 2. Cálculo de Regularidad (70% de asistencia)
- **Requisito:** El alumno debe tener al menos un 70% de asistencia para mantener la regularidad.
- **Acción sugerida:**
  - Comprobar que sea posible calcular el total de clases dictadas para una `ComisionMateria`.
  - Asegurarse de que la entidad `Asistencia` esté correctamente mapeada contra `AlumnoInscripto` (o `Alumno` + `ComisionMateria`) para poder sumar las presencias.
  - La lógica del cálculo se hará en los servicios (`@Service`), pero el modelo debe tener los campos listos (por ejemplo, el campo `boolean presente` en `Asistencia`).

## 3. Manejo y Transición de Estados
- **Requisito:** Reflejar el estado académico del alumno en la materia (Regular, Libre, Promocionado).
- **Acción sugerida:** Revisar la entidad `EstadoCursada`. Debe poder automatizar su transición (por ejemplo, pasar a "Libre" si la inasistencia supera el 30%). Es conveniente tener definidos estos estados base de alguna forma estática o como `ENUM` si resulta más simple de consultar en el backend.

## 4. Revisión de Relaciones (Foreign Keys) en JPA
- **Requisito:** Generación de reportes académicos.
- **Acción sugerida:** Validar las anotaciones de las relaciones bidireccionales y unidireccionales (`@OneToMany`, `@ManyToOne`, `@JoinColumn`).
  - Ejemplo: Un `Examen` tiene muchas `Nota`s. Una `ComisionMateria` dicta una `Materia` y tiene un `Profesor`.
  - Esto es fundamental para evitar problemas de _N+1 queries_ y garantizar que las consultas para reportes sean óptimas.

## 5. Auditoría y Fechas (Opcional pero recomendado)
- **Acción sugerida:** Verificar si las entidades de inscripción (`AlumnoCarrera`, `AlumnoInscripto`) y de registros transaccionales guardan una fecha (ej. `LocalDateTime fechaInscripcion`, `fechaAuditoria`). Esto ayuda a mantener un historial claro, alineado con el requerimiento de tener una "baja lógica" y no borrar historial.

---
**Conclusión:**
La base es excelente. No hace falta reconstruir el modelo de datos. Solo se deben hacer validaciones puntuales de atributos y anotaciones JPA antes de programar los Controladores y Servicios.
