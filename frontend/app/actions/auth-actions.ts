"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getApiBaseUrl } from "@/lib/api-server"
import {
  COOKIE_ROL,
  COOKIE_SESION,
  RUTA_ELECCION_ROL,
  RUTA_PANEL,
  decodificarJwt,
  segundosHastaVencer,
} from "@/lib/sesion"

export interface EstadoLogin {
  error: string | null
}

const MENSAJE_CAMPOS_OBLIGATORIOS = "Usuario y contraseña son obligatorios"
const MENSAJE_CREDENCIALES_INVALIDAS = "Credenciales inválidas"
const MENSAJE_USUARIO_INACTIVO = "Usuario inactivo o sin permisos"
const MENSAJE_ERROR_GENERICO = "No se pudo iniciar sesión. Intentá de nuevo."

function ahoraEnSegundos() {
  return Math.floor(Date.now() / 1000)
}

// Cookies httpOnly (RF-01): el codigo de la pagina no puede leerlas. Vencen
// junto con el JWT. Sin Secure: el proyecto corre solo en local por HTTP.
function opcionesCookie(jwt: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: segundosHastaVencer(jwt, ahoraEnSegundos()),
  }
}

export async function loginAction(_estadoPrevio: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!username || !password) return { error: MENSAJE_CAMPOS_OBLIGATORIOS } // RF-05

  let jwt: string
  try {
    // Contra el Gateway (C2.5): /api/v1/auth/login es la unica ruta sin JWT.
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    })

    if (response.status === 401) return { error: MENSAJE_CREDENCIALES_INVALIDAS } // RF-03
    if (response.status === 403) return { error: MENSAJE_USUARIO_INACTIVO } // RF-04
    if (!response.ok) return { error: MENSAJE_ERROR_GENERICO }

    const json = await response.json()
    jwt = json?.data?.[0]?.token
    if (!jwt) return { error: MENSAJE_ERROR_GENERICO }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { error: MENSAJE_ERROR_GENERICO }
  }

  const roles = decodificarJwt(jwt)?.roles ?? []
  if (roles.length === 0) return { error: MENSAJE_USUARIO_INACTIVO }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_SESION, jwt, opcionesCookie(jwt))

  if (roles.length === 1) {
    cookieStore.set(COOKIE_ROL, roles[0], opcionesCookie(jwt)) // RF-06
    redirect(RUTA_PANEL)
  }

  cookieStore.delete(COOKIE_ROL) // RF-07: un usuario multi-rol elige antes de entrar
  redirect(RUTA_ELECCION_ROL)
}
