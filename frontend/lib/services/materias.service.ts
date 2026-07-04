import apiClient from "@/lib/api-client"

// Coincide con MateriaResponse del Core.
export interface Materia {
  id: number
  nombre: string
  cargaHoraria: number
  anio: number
  cuatrimestre: number
  activa: boolean
  planEstudioId: number
  planEstudioValidez: string
  correlativasIds: number[]
}

const BASE_PATH = "/api/core/materias"

export async function listarMaterias(): Promise<Materia[]> {
  const response = await apiClient.get<Materia[]>(BASE_PATH)
  return response.data
}
