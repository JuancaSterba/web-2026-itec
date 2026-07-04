import apiClient from "@/lib/api-client"

export type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "TARDE"

// ms-asistencias es un microservicio aislado: solo conoce alumnoId (numero),
// nunca el nombre del alumno -- ese cruce lo hace el frontend con los datos
// del Core (ver app/dashboard/asistencias/page.tsx). Ademas, a diferencia del
// Core, ms-asistencias devuelve el recurso directo en el body, sin envolverlo
// en {meta,data,errors} -- por eso se usan los metodos *Raw del api-client.
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
  return apiClient.getRaw<Asistencia[]>(BASE_PATH)
}

export async function registrarAsistencia(input: AsistenciaInput): Promise<Asistencia> {
  return apiClient.postRaw<Asistencia>(BASE_PATH, input)
}

export async function actualizarAsistencia(id: number, input: AsistenciaInput): Promise<Asistencia> {
  return apiClient.putRaw<Asistencia>(`${BASE_PATH}/${id}`, input)
}
