// lib/auth-server.ts
// Decodifica el JWT de la cookie auth-token del lado del servidor (Server
// Components). Mismo shape de payload que ya decodifica hooks/use-auth.tsx
// en cliente con la misma librería (jwt-decode v4, sin dependencia de
// window, funciona igual en Node).
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  username: string
  roles: string[]
  datos_personales?: {
    dni?: string
    nombre?: string
    apellido?: string
    email?: string
    telefono?: string
  }
}

export interface UsuarioActual {
  username: string
  roles: string[]
  dni: string | null
}

export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      username: decoded.username,
      roles: decoded.roles ?? [],
      dni: decoded.datos_personales?.dni ?? null,
    }
  } catch {
    return null
  }
}
