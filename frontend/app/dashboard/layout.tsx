import type React from "react"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import Breadcrumbs from "@/components/layout/breadcrumbs"
import { getUsuarioActual } from "@/lib/auth-server"
import { RUTA_ELECCION_ROL, RUTA_LOGIN } from "@/lib/sesion"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Segunda capa del proxy: sin sesion valida (RF-16) o sin rol elegido (RF-20).
  const usuario = await getUsuarioActual()
  if (!usuario) redirect(RUTA_LOGIN)
  if (!usuario.rolActivo) redirect(RUTA_ELECCION_ROL)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Breadcrumbs />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
