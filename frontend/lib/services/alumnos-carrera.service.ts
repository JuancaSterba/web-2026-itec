import apiClient from "@/lib/api-client"

// Coincide con AlumnoCarreraResponse del Core. A diferencia de
// AlumnoInscriptoResponse, esta si trae el alumnoId real -- es el unico
// lugar donde el Core lo expone para una inscripcion a materia.
export interface AlumnoCarrera {
  id: number
  alumnoId: number
  alumnoNombreCompleto: string
  carreraId: number
  carreraNombre: string
  planEstudioId: number
  planEstudioResolucion: string | null
  anioIngreso: number | null
}

const BASE_PATH = "/api/core/inscripciones-carreras"

export async function obtenerAlumnoCarrera(id: number): Promise<AlumnoCarrera> {
  const response = await apiClient.get<AlumnoCarrera[]>(`${BASE_PATH}/${id}`)
  return response.data[0]
}
