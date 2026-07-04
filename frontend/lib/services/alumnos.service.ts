import apiClient from "@/lib/api-client"

// Coincide con AlumnoResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
export interface Alumno {
  id: number
  legajo: string
  activo: boolean
  userId: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}

// POST /api/core/alumnos ahora es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=ALUMNO) y el Alumno en
// la misma transaccion (ver docs/Reglas_de_Negocio.md y AlumnoRegistroDTO).
// El legajo ya no se pide: el Core lo autogenera como AAAA-DNI.
export interface CrearAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}

// AlumnoUpdateRequest del Core: solo legajo y estado activo son editables.
export interface ActualizarAlumnoInput {
  legajo: string
  activo: boolean
}

const BASE_PATH = "/api/core/alumnos"

export async function listarAlumnos(): Promise<Alumno[]> {
  const response = await apiClient.get<Alumno[]>(BASE_PATH)
  return response.data
}

export async function crearAlumno(input: CrearAlumnoInput): Promise<Alumno> {
  const response = await apiClient.post<Alumno[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAlumno(id: number, input: ActualizarAlumnoInput): Promise<Alumno> {
  const response = await apiClient.put<Alumno[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarAlumno(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
