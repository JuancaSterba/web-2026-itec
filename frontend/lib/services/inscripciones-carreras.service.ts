import apiClient from "@/lib/api-client"

// Coincide con AlumnoCarreraResponse del Core.
export interface InscripcionCarrera {
  id: number
  alumnoId: number
  alumnoNombreCompleto: string
  carreraId: number
  carreraNombre: string
  planEstudioId: number
  planEstudioResolucion: string
  anioIngreso: number
}

export interface InscripcionCarreraInput {
  alumnoId: number
  carreraId: number
  planEstudioId: number
  anioIngreso: number
}

const BASE_PATH = "/api/core/inscripciones-carreras"

export async function listarInscripcionesCarreraPorAlumno(alumnoId: number): Promise<InscripcionCarrera[]> {
  const response = await apiClient.get<InscripcionCarrera[]>(`${BASE_PATH}/alumno/${alumnoId}`)
  return response.data
}

export async function crearInscripcionCarrera(input: InscripcionCarreraInput): Promise<InscripcionCarrera> {
  const response = await apiClient.post<InscripcionCarrera[]>(BASE_PATH, input)
  return response.data[0]
}

export async function eliminarInscripcionCarrera(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
