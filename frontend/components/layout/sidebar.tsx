"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR", "ALUMNO"] },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Users, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Profesores", href: "/dashboard/profesores", icon: GraduationCap, roles: ["ADMIN"] },
  // { name: "Materias", href: "/dashboard/materias", icon: BookOpen, roles: ["ADMIN", "ADMINISTRATIVO"] }, // oculto: PENDIENTES.md Prioridad 1
  { name: "Comisiones", href: "/dashboard/comisiones", icon: Calendar, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Asistencias", href: "/dashboard/asistencias", icon: UserCheck, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR"] },
  { name: "Calificaciones", href: "/dashboard/notas", icon: ClipboardCheck, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR"] },
  // { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3, roles: ["ADMIN", "ADMINISTRATIVO"] }, // oculto: PENDIENTES.md Prioridad 1
  // { name: "Certificados", href: "/dashboard/certificados", icon: FileText, roles: ["ADMIN", "ADMINISTRATIVO"] }, // oculto: PENDIENTES.md Prioridad 1
  // { name: "Configuración", href: "/dashboard/configuraciones", icon: Settings, roles: ["ADMIN"] }, // oculto: PENDIENTES.md Prioridad 1
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-4">
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-semibold text-sidebar-foreground">
              ITEC N°1
            </h2>
            <p className="truncate text-xs text-sidebar-foreground/60">Backoffice Académico</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
