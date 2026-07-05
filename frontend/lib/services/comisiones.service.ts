import apiClient from "@/lib/api-client"

// Coincide con ComisionResponse del Core. materiaNombre/cuatrimestreAnio/
// cuatrimestreNumero/profesorNombre/profesorApellido/profesorTitulo vienen
// denormalizados desde las entidades relacionadas -- no son editables aca.
export interface Comision {
  id: number
  nombre: string
  cupo: number
  activa: boolean
  materiaId: number
  materiaNombre: string
  cuatrimestreId: number
  cuatrimestreAnio: number
  cuatrimestreNumero: number
  profesorId: number
  profesorNombre: string
  profesorApellido: string
  profesorTitulo: string
}

// ComisionRequest del Core: no tiene "turno" -- la comision se define por
// Materia + Cuatrimestre + Profesor.
export interface ComisionInput {
  nombre: string
  cupo: number
  materiaId: number
  cuatrimestreId: number
  profesorId: number
  activa: boolean
}

const BASE_PATH = "/api/core/comisiones"

export async function listarComisiones(): Promise<Comision[]> {
  const response = await apiClient.get<Comision[]>(BASE_PATH)
  return response.data
}

export async function obtenerComisionPorId(id: number): Promise<Comision> {
  const response = await apiClient.get<Comision[]>(`${BASE_PATH}/${id}`)
  return response.data[0]
}

export async function crearComision(input: ComisionInput): Promise<Comision> {
  const response = await apiClient.post<Comision[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarComision(id: number, input: ComisionInput): Promise<Comision> {
  const response = await apiClient.put<Comision[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarComision(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
