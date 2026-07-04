import { listarInscripciones } from "@/lib/services/inscripciones.service"
import { obtenerAlumnoCarrera } from "@/lib/services/alumnos-carrera.service"

// Resuelve la lista de alumnos inscriptos en una comision con su alumnoId
// real (ver docs/deuda_tecnica.md #1: el Core no expone alumnoId directo en
// las inscripciones, hay que resolverlo por alumno-carrera). Compartido
// entre Asistencias y Calificaciones para no duplicar el N+1.
export interface AlumnoRoster {
  alumnoId: number
  nombreCompleto: string
}

export async function obtenerRosterComision(comisionId: number): Promise<AlumnoRoster[]> {
  const inscripciones = await listarInscripciones()
  const inscriptosComision = inscripciones.filter((i) => i.comisionMateriaId === comisionId)

  const alumnosCarrera = await Promise.all(
    inscriptosComision.map((i) => obtenerAlumnoCarrera(i.alumnoCarreraId))
  )

  return inscriptosComision.map((insc, idx) => ({
    alumnoId: alumnosCarrera[idx].alumnoId,
    nombreCompleto: insc.alumnoNombreCompleto,
  }))
}
