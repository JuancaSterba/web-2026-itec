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

// Crear un alumno en la practica es registrar un Usuario con rol ALUMNO:
// UsuarioCallbackImpl dispara crearAlumnoConUsuario() como efecto secundario
// del registro (ver backend/core AlumnoServiceImpl.crearAlumnoConUsuario).
// El endpoint POST /api/alumnos (userId+legajo) existe para el caso borde de
// un usuario que YA tiene rol ALUMNO pero por algun motivo no tiene alumno
// asociado -- no es el flujo de alta normal, asi que no se usa aca.
export interface CrearAlumnoInput {
  username: string
  password: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}

// AlumnoUpdateRequest del Core: solo legajo y estado activo son editables.
// El legajo no se asigna en la creacion (queda null) -- se carga despues
// desde "Editar", que es exactamente como se comporta el Core hoy.
export interface ActualizarAlumnoInput {
  legajo: string
  activo: boolean
}

const BASE_PATH = "/api/core/alumnos"
const REGISTER_PATH = "/api/core/auth/register"

export async function listarAlumnos(): Promise<Alumno[]> {
  const response = await apiClient.get<Alumno[]>(BASE_PATH)
  return response.data
}

export async function crearAlumno(input: CrearAlumnoInput): Promise<void> {
  await apiClient.post<string>(REGISTER_PATH, { ...input, roles: ["ALUMNO"] })
}

export async function actualizarAlumno(id: number, input: ActualizarAlumnoInput): Promise<Alumno> {
  const response = await apiClient.put<Alumno[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarAlumno(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
