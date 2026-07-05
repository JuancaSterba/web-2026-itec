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

export interface MateriaInput {
  nombre: string
  cargaHoraria: number
  anio: number
  cuatrimestre: number
  planEstudioId: number
}

const BASE_PATH = "/api/core/materias"

export async function listarMaterias(): Promise<Materia[]> {
  const response = await apiClient.get<Materia[]>(BASE_PATH)
  return response.data
}

export async function listarMateriasPorPlan(planId: number): Promise<Materia[]> {
  const response = await apiClient.get<Materia[]>(`${BASE_PATH}/plan/${planId}`)
  return response.data
}

export async function crearMateria(input: MateriaInput): Promise<Materia> {
  const response = await apiClient.post<Materia[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarMateria(id: number, input: MateriaInput): Promise<Materia> {
  const response = await apiClient.put<Materia[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarMateria(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}

export async function asignarCorrelativas(id: number, correlativasIds: number[]): Promise<Materia> {
  const response = await apiClient.post<Materia[]>(`${BASE_PATH}/${id}/correlativas`, correlativasIds)
  return response.data[0]
}
