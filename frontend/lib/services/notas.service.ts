import apiClient from "@/lib/api-client"

// ms-notas devuelve el recurso directo, sin envolverlo en {meta,data,errors}
// como el Core -- mismo motivo que ms-asistencias (ver docs/deuda_tecnica.md #2).
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
  return apiClient.getRaw<Examen[]>(EXAMENES_PATH)
}

export async function crearExamen(input: ExamenInput): Promise<Examen> {
  return apiClient.postRaw<Examen>(EXAMENES_PATH, input)
}

export async function listarNotas(): Promise<Nota[]> {
  return apiClient.getRaw<Nota[]>(NOTAS_PATH)
}

export async function registrarNota(input: NotaInput): Promise<Nota> {
  return apiClient.postRaw<Nota>(NOTAS_PATH, input)
}

export async function actualizarNota(id: number, input: NotaInput): Promise<Nota> {
  return apiClient.putRaw<Nota>(`${NOTAS_PATH}/${id}`, input)
}
