import apiClient from "@/lib/api-client"

export type RolAdministrador = "ADMIN" | "ADMINISTRATIVO"

// Coincide con UsuarioAdminResponse del backend (modulo security).
export interface Administrador {
  id: number
  username: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  rol: RolAdministrador
  enabled: boolean
}

// POST /api/core/administradores: alta de un solo paso, username=DNI,
// password=DNI encriptada (BCrypt), enabled=true (a diferencia de Alumno/
// Profesor, este rol si tiene login inmediato).
export interface CrearAdministradorInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  rol: RolAdministrador
}

export interface ActualizarAdministradorInput {
  dni: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: RolAdministrador
  enabled: boolean
}

const BASE_PATH = "/api/core/administradores"

export async function listarAdministradores(): Promise<Administrador[]> {
  const response = await apiClient.get<Administrador[]>(BASE_PATH)
  return response.data
}

export async function crearAdministrador(input: CrearAdministradorInput): Promise<Administrador> {
  const response = await apiClient.post<Administrador[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAdministrador(
  id: number,
  input: ActualizarAdministradorInput
): Promise<Administrador> {
  const response = await apiClient.put<Administrador[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function resetPasswordAdministrador(id: number): Promise<Administrador> {
  const response = await apiClient.post<Administrador[]>(`${BASE_PATH}/${id}/reset-password`)
  return response.data[0]
}
