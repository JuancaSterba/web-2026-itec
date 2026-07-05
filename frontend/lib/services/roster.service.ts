import { listarInscripciones } from "@/lib/services/inscripciones.service"

// Resuelve la lista de alumnos inscriptos en una comision. Compartido entre
// Asistencias, Calificaciones e Inscripcion de Alumnos para no duplicar el
// filtrado. `id` (de la inscripcion) se agrega para poder dar de baja desde
// la nomina -- alumnoId/nombreCompleto se mantienen igual para no romper a
// los consumidores existentes.
//
// Antes esto hacia 1 + N llamadas: listar inscripciones y despues, por cada
// fila, GET /api/inscripciones-carreras/{id} para resolver el alumnoId real
// (deuda_tecnica.md #1). El Core ahora devuelve alumnoId/nombre/apellido ya
// resueltos con un JOIN FETCH en una sola consulta, asi que esto es un solo
// fetch + un filtro en memoria -- sin peticiones en cascada.
export interface AlumnoRoster {
  id: number
  alumnoId: number
  nombreCompleto: string
  dni: string
  legajo: string
}

export async function obtenerRosterComision(comisionId: number): Promise<AlumnoRoster[]> {
  const inscripciones = await listarInscripciones()

  return inscripciones
    .filter((i) => i.comisionMateriaId === comisionId)
    .map((i) => ({
      id: i.id,
      alumnoId: i.alumnoId,
      nombreCompleto: `${i.nombre} ${i.apellido}`,
      dni: i.dni,
      legajo: i.legajo,
    }))
}
