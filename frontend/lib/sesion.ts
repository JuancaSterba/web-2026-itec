// lib/sesion.ts
// Reglas de sesion como funciones puras (sin cookies ni redirects): las usan
// el proxy, las Server Actions de auth y lib/auth-server.ts. El JWT se
// decodifica sin verificar la firma: solo decide redirecciones y UI; la
// autorizacion real la hacen el Gateway y el Core.
import { jwtDecode } from "jwt-decode"

// Cookies httpOnly: solo las escribe el servidor de Next.
export const COOKIE_SESION = "itec-sesion"
export const COOKIE_ROL = "itec-rol"
// Cookie de la version anterior (no httpOnly): se borra al verla.
export const COOKIE_LEGADA = "auth-token"

export const RUTA_LOGIN = "/login"
export const RUTA_ELECCION_ROL = "/seleccionar-rol"
export const RUTA_PANEL = "/dashboard"
export const RUTA_SESION_EXPIRADA = "/login?motivo=expirada"

export interface SesionJwt {
  username: string
  roles: string[]
  exp?: number
  datos_personales?: {
    dni?: string
    nombre?: string
    apellido?: string
    email?: string
    telefono?: string
  }
}

export type DecisionAcceso =
  | { tipo: "pasar" }
  | { tipo: "redirigir"; destino: string; borrarSesion: boolean }

export function decodificarJwt(jwt: string | null | undefined): SesionJwt | null {
  if (!jwt) return null
  try {
    const payload = jwtDecode<SesionJwt>(jwt)
    return { ...payload, roles: Array.isArray(payload.roles) ? payload.roles : [] }
  } catch {
    return null
  }
}

export function sesionVencida(jwt: string, ahoraSeg: number): boolean {
  const exp = decodificarJwt(jwt)?.exp
  return exp === undefined || exp <= ahoraSeg
}

// Max-Age de las cookies: la sesion y el rol activo vencen junto con el JWT.
export function segundosHastaVencer(jwt: string, ahoraSeg: number): number {
  const exp = decodificarJwt(jwt)?.exp
  return exp === undefined ? 0 : Math.max(0, exp - ahoraSeg)
}

// Roles fijos desde el login (RF-24): siempre salen del JWT, no del Core.
export function rolActivoValido(jwt: string, rolActivo: string | null | undefined): boolean {
  if (!rolActivo) return false
  return decodificarJwt(jwt)?.roles.includes(rolActivo) ?? false
}

function pasar(): DecisionAcceso {
  return { tipo: "pasar" }
}

function irA(destino: string, borrarSesion = false): DecisionAcceso {
  return { tipo: "redirigir", destino, borrarSesion }
}

// "/" y "/login" son publicas; todo lo demas que matchea el proxy es interno.
export function decidirAcceso(
  ruta: string,
  jwt: string | null | undefined,
  rolActivo: string | null | undefined,
  ahoraSeg: number
): DecisionAcceso {
  const esPublica = ruta === "/" || ruta === RUTA_LOGIN
  const esEleccionRol = ruta === RUTA_ELECCION_ROL

  if (!jwt) return esPublica ? pasar() : irA(RUTA_LOGIN) // RF-16

  if (sesionVencida(jwt, ahoraSeg)) {
    // En "/" no hace falta el aviso: el usuario todavia no estaba navegando.
    return ruta === "/" ? irA("/", true) : irA(RUTA_SESION_EXPIRADA, true) // RF-17
  }

  const tieneRolActivo = rolActivoValido(jwt, rolActivo)

  if (esPublica) return irA(tieneRolActivo ? RUTA_PANEL : RUTA_ELECCION_ROL) // RF-18
  if (!tieneRolActivo && !esEleccionRol) return irA(RUTA_ELECCION_ROL) // RF-20

  return pasar()
}
