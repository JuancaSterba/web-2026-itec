import { listarInscripciones } from "@/lib/services/inscripciones.service"

// Resuelve la lista de alumnos inscriptos en una comision. Compartido entre
// Asistencias y Calificaciones para no duplicar el filtrado.
//
// Antes esto hacia 1 + N llamadas: listar inscripciones y despues, por cada
// fila, GET /api/inscripciones-carreras/{id} para resolver el alumnoId real
// (deuda_tecnica.md #1). El Core ahora devuelve alumnoId/nombre/apellido ya
// resueltos con un JOIN FETCH en una sola consulta, asi que esto es un solo
// fetch + un filtro en memoria -- sin peticiones en cascada.
export interface AlumnoRoster {
  alumnoId: number
  nombreCompleto: string
}

export async function obtenerRosterComision(comisionId: number): Promise<AlumnoRoster[]> {
  const inscripciones = await listarInscripciones()

  return inscripciones
    .filter((i) => i.comisionMateriaId === comisionId)
    .map((i) => ({
      alumnoId: i.alumnoId,
      nombreCompleto: `${i.nombre} ${i.apellido}`,
    }))
}
