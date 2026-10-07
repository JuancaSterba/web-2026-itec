// lib/auth-server.ts
// Sesion del lado del servidor (Server Components y Server Actions): lee las
// cookies httpOnly itec-sesion (JWT) e itec-rol (rol activo). Las reglas
// viven en lib/sesion.ts.
import { cookies } from "next/headers"
import { COOKIE_ROL, COOKIE_SESION, decodificarJwt, rolActivoValido, sesionVencida } from "@/lib/sesion"

export interface UsuarioActual {
  username: string
  // Roles fijos desde el login (RF-24).
  roles: string[]
  // null hasta que un usuario multi-rol elige uno (RF-07).
  rolActivo: string | null
  dni: string | null
  nombre: string | null
  apellido: string | null
}

export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_SESION)?.value
  if (!token || sesionVencida(token, Math.floor(Date.now() / 1000))) return null

  const decoded = decodificarJwt(token)
  if (!decoded) return null

  const rolActivo = cookieStore.get(COOKIE_ROL)?.value ?? null
  const datos = decoded.datos_personales

  return {
    username: decoded.username,
    roles: decoded.roles,
    rolActivo: rolActivoValido(token, rolActivo) ? rolActivo : null,
    dni: datos?.dni ?? null,
    nombre: datos?.nombre ?? null,
    apellido: datos?.apellido ?? null,
  }
}
