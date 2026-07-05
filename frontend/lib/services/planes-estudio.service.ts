import apiClient from "@/lib/api-client"

// Coincide con PlanEstudioResponse del Core.
export interface PlanEstudio {
  id: number
  validez: string
  resolucion: string
  fechaInicio: string
  fechaFin: string
  activo: boolean
  carreraId: number
  carreraNombre: string
}

export interface PlanEstudioInput {
  validez: string
  resolucion: string
  fechaInicio: string
  fechaFin: string
  carreraId: number
}

const BASE_PATH = "/api/core/planes-estudio"

export async function listarPlanesEstudio(): Promise<PlanEstudio[]> {
  const response = await apiClient.get<PlanEstudio[]>(BASE_PATH)
  return response.data
}

export async function crearPlanEstudio(input: PlanEstudioInput): Promise<PlanEstudio> {
  const response = await apiClient.post<PlanEstudio[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarPlanEstudio(id: number, input: PlanEstudioInput): Promise<PlanEstudio> {
  const response = await apiClient.put<PlanEstudio[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarPlanEstudio(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
