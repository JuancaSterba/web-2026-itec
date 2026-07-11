import apiClient from "@/lib/api-client"

export type RolAdministrador = "ADMIN" | "ADMINISTRATIVO"

// Coincide con UsuarioAdminResponse del backend (modulo security).
// Un usuario puede tener ADMIN y ADMINISTRATIVO a la vez (ej. un
// super-usuario para el director de la institucion).
export interface Administrador {
  id: number
  username: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  roles: RolAdministrador[]
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
  roles: RolAdministrador[]
}

export interface ActualizarAdministradorInput {
  dni: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  roles: RolAdministrador[]
  enabled: boolean
}


