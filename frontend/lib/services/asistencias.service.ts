import apiClient from "@/lib/api-client"

export type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "TARDE"

// ms-asistencias es un microservicio aislado: solo conoce alumnoId (numero),
// nunca el nombre del alumno -- ese cruce lo hace el frontend con los datos
// del Core (ver app/dashboard/asistencias/page.tsx).
export interface Asistencia {
  id: number
  alumnoId: number
  comisionId: number
  fecha: string // YYYY-MM-DD
  estado: EstadoAsistencia
}

export interface AsistenciaInput {
  alumnoId: number
  comisionId: number
  fecha: string
  estado: EstadoAsistencia
}

const BASE_PATH = "/api/asistencias"

// Sin filtro por comisionId/fecha en el microservicio todavia: se trae todo
// y se filtra en el cliente.
export async function listarAsistencias(): Promise<Asistencia[]> {
  const response = await apiClient.get<Asistencia[]>(BASE_PATH)
  return response.data
}

export async function registrarAsistencia(input: AsistenciaInput): Promise<Asistencia> {
  const response = await apiClient.post<Asistencia[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAsistencia(id: number, input: AsistenciaInput): Promise<Asistencia> {
  const response = await apiClient.put<Asistencia[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}
