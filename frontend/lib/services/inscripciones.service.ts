import apiClient from "@/lib/api-client"

// Coincide con AlumnoInscriptoResponse del Core. OJO: no trae alumnoId
// directo, solo alumnoCarreraId -- hay que resolverlo con
// alumnos-carrera.service.ts (ver comentario en asistencias/page.tsx).
export interface AlumnoInscripto {
  id: number
  alumnoCarreraId: number
  alumnoNombreCompleto: string
  comisionMateriaId: number
  materiaNombre: string
  comisionNombre: string
  estado: string
  notaFinal: number | null
}

const BASE_PATH = "/api/core/inscripciones-materias"

// No hay filtro por comisionMateriaId en el Core todavia: se trae todo y se
// filtra en el cliente (mismo patron que ms-asistencias, que tampoco filtra).
export async function listarInscripciones(): Promise<AlumnoInscripto[]> {
  const response = await apiClient.get<AlumnoInscripto[]>(BASE_PATH)
  return response.data
}
