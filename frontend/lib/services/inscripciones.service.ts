import apiClient from "@/lib/api-client"

// Coincide con AlumnoInscriptoResponse del Core. DTO aplanado (deuda tecnica
// #1 resuelta): antes solo traia alumnoCarreraId + un nombre armado, y habia
// que pedir /inscripciones-carreras/{id} por cada fila para resolver el
// alumnoId real. Ahora alumnoId/nombre/apellido/dni/legajo vienen directos,
// resueltos con un solo JOIN FETCH en el Core (ver AlumnoInscriptoRepository).
export interface AlumnoInscripto {
  id: number
  alumnoCarreraId: number
  alumnoId: number
  nombre: string
  apellido: string
  dni: string
  legajo: string
  comisionMateriaId: number
  materiaNombre: string
  comisionNombre: string
  estado: string
  notaFinal: number | null
}

export interface InscripcionMateriaInput {
  alumnoCarreraId: number
  comisionMateriaId: number
}

const BASE_PATH = "/api/core/inscripciones-materias"

// No hay filtro por comisionMateriaId en el Core todavia: se trae todo y se
// filtra en el cliente (mismo patron que ms-asistencias, que tampoco filtra).
export async function listarInscripciones(): Promise<AlumnoInscripto[]> {
  const response = await apiClient.get<AlumnoInscripto[]>(BASE_PATH)
  return response.data
}

export async function crearInscripcionMateria(input: InscripcionMateriaInput): Promise<AlumnoInscripto> {
  const response = await apiClient.post<AlumnoInscripto[]>(BASE_PATH, input)
  return response.data[0]
}

export async function eliminarInscripcionMateria(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
