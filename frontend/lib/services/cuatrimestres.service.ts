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

export interface CuatrimestreInput {
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

export async function crearCuatrimestre(input: CuatrimestreInput): Promise<Cuatrimestre> {
  const response = await apiClient.post<Cuatrimestre[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarCuatrimestre(id: number, input: CuatrimestreInput): Promise<Cuatrimestre> {
  const response = await apiClient.put<Cuatrimestre[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarCuatrimestre(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
