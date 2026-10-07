import { NextRequest, NextResponse } from "next/server"
import { COOKIE_LEGADA, COOKIE_ROL, COOKIE_SESION, decidirAcceso } from "@/lib/sesion"

const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_URL // ej: http://localhost:3000

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // No interceptar estáticos ni APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next()
  }

  // Reglas en lib/sesion.ts: sin sesion → login (RF-16), vencida → login con
  // aviso (RF-17), con sesion en "/" o "/login" → panel (RF-18), multi-rol
  // sin rol elegido → eleccion de rol (RF-20).
  const decision = decidirAcceso(
    pathname,
    req.cookies.get(COOKIE_SESION)?.value,
    req.cookies.get(COOKIE_ROL)?.value,
    Math.floor(Date.now() / 1000)
  )

  const response =
    decision.tipo === "pasar"
      ? NextResponse.next()
      : NextResponse.redirect(new URL(decision.destino, FRONTEND_BASE || req.url))

  if (decision.tipo === "redirigir" && decision.borrarSesion) {
    response.cookies.delete(COOKIE_SESION)
    response.cookies.delete(COOKIE_ROL)
  }

  // La cookie de la version anterior no era httpOnly: se descarta (RF-19).
  if (req.cookies.has(COOKIE_LEGADA)) response.cookies.delete(COOKIE_LEGADA)

  return response
}

export const config = {
  // Incluye "/" y "/login" para mandar al panel a quien ya tiene sesion.
  matcher: ["/", "/login", "/dashboard/:path*", "/perfil", "/seleccionar-rol", "/materias/:path*", "/alumnos/:path*", "/profesores/:path*"],
}
