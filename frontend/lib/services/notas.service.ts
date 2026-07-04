import apiClient from "@/lib/api-client"

export interface Examen {
  id: number
  comisionId: number
  nombre: string
  fecha: string // YYYY-MM-DD
}

export interface ExamenInput {
  comisionId: number
  nombre: string
  fecha: string
}

export interface Nota {
  id: number
  examenId: number
  alumnoId: number
  valor: number
  observaciones: string | null
}

export interface NotaInput {
  examenId: number
  alumnoId: number
  valor: number
  observaciones?: string
}

const EXAMENES_PATH = "/api/examenes"
const NOTAS_PATH = "/api/notas"

// Sin filtro por comisionId en el microservicio todavia: se trae todo y se
// filtra en el cliente (mismo patron que asistencias.service.ts).
export async function listarExamenes(): Promise<Examen[]> {
  const response = await apiClient.get<Examen[]>(EXAMENES_PATH)
  return response.data
}

export async function crearExamen(input: ExamenInput): Promise<Examen> {
  const response = await apiClient.post<Examen[]>(EXAMENES_PATH, input)
  return response.data[0]
}

export async function listarNotas(): Promise<Nota[]> {
  const response = await apiClient.get<Nota[]>(NOTAS_PATH)
  return response.data
}

export async function registrarNota(input: NotaInput): Promise<Nota> {
  const response = await apiClient.post<Nota[]>(NOTAS_PATH, input)
  return response.data[0]
}

export async function actualizarNota(id: number, input: NotaInput): Promise<Nota> {
  const response = await apiClient.put<Nota[]>(`${NOTAS_PATH}/${id}`, input)
  return response.data[0]
}
