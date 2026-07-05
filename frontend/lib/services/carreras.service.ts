import apiClient from "@/lib/api-client"

// Coincide con CarreraResponse del Core.
export interface Carrera {
  id: number
  nombre: string
  descripcion: string
  resolucion: string
  activa: boolean
}

export interface CarreraInput {
  nombre: string
  descripcion: string
  resolucion: string
}

const BASE_PATH = "/api/core/carreras"

export async function listarCarreras(): Promise<Carrera[]> {
  const response = await apiClient.get<Carrera[]>(BASE_PATH)
  return response.data
}

export async function crearCarrera(input: CarreraInput): Promise<Carrera> {
  const response = await apiClient.post<Carrera[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarCarrera(id: number, input: CarreraInput): Promise<Carrera> {
  const response = await apiClient.put<Carrera[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarCarrera(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
