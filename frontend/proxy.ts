import { NextRequest, NextResponse } from "next/server"

const LOGIN_PATH = process.env.NEXT_PUBLIC_LOGIN_PATH || "/login"
const DASHBOARD_PATH = process.env.NEXT_PUBLIC_DASHBOARD_PATH || "/dashboard"
const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_URL // ej: http://localhost:3000

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("auth-token")?.value
  const isAuth = !!token

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

  // (Opcional) Home: decidir según cookie
  if (pathname === "/") {
    const dest = isAuth ? DASHBOARD_PATH : LOGIN_PATH
    return NextResponse.redirect(new URL(dest, FRONTEND_BASE || req.url))
  }

  // Si no está autenticado y no es /login → a /login
  if (!isAuth && pathname !== LOGIN_PATH) {
    return NextResponse.redirect(new URL(LOGIN_PATH, FRONTEND_BASE || req.url))
  }

  // Si está autenticado e intenta ir a /login → a /dashboard
  if (isAuth && pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, FRONTEND_BASE || req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Incluimos /login para que aplique la regla de "si ya estás logueado, mandá al dashboard"
  matcher: ["/", "/login", "/dashboard/:path*", "/materias/:path*", "/alumnos/:path*", "/profesores/:path*", "/seleccionar-rol"],
}
