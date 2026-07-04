import apiClient from "@/lib/api-client"

// Coincide con CuatrimestreResponse del Core.
export interface Cuatrimestre {
  id: number
  anio: number
  numero: number
  fechaInicio: string
  fechaFin: string
  actual: boolean
}

const BASE_PATH = "/api/core/cuatrimestres"

export async function listarCuatrimestres(): Promise<Cuatrimestre[]> {
  const response = await apiClient.get<Cuatrimestre[]>(BASE_PATH)
  return response.data
}
