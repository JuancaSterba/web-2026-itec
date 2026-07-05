import apiClient from "@/lib/api-client"

// Coincide con ProfesorResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
export interface Profesor {
  id: number
  titulo: string
  telefonoSecundario: string
  activo: boolean
  userId: number
  username: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}

// POST /api/core/profesores es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=PROFESOR, enabled=false)
// y el Profesor en la misma transaccion (ver docs/Reglas_de_Negocio.md).
export interface CrearProfesorInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  titulo: string
  telefonoSecundario: string
}

// ProfesorUpdateRequest del Core: dni, titulo, telefonoSecundario y activo
// son editables. Si el dni cambia, el Core recalcula el legajo.
export interface ActualizarProfesorInput {
  dni: string
  titulo: string
  telefonoSecundario: string
  activo: boolean
}

const BASE_PATH = "/api/core/profesores"

export async function listarProfesores(): Promise<Profesor[]> {
  const response = await apiClient.get<Profesor[]>(BASE_PATH)
  return response.data
}

export async function crearProfesor(input: CrearProfesorInput): Promise<Profesor> {
  const response = await apiClient.post<Profesor[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarProfesor(id: number, input: ActualizarProfesorInput): Promise<Profesor> {
  const response = await apiClient.put<Profesor[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarProfesor(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
