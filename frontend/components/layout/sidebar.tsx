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
  ClipboardList,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const ALL_ROLES = ["ADMIN", "ADMINISTRATIVO", "PROFESOR", "ALUMNO"]

export const navigation = [
  {
    group: null,
    items: [{ name: "Inicio", href: "/dashboard", icon: Home, roles: ALL_ROLES }],
  },
  {
    group: "Institución",
    items: [
      { name: "Catálogo de Materias", href: "/dashboard/materias", icon: BookOpen, roles: ["ADMIN", "ADMINISTRATIVO"] },
    ],
  },
  {
    group: "Catálogo Académico",
    items: [
      { name: "Carreras y Planes", href: "/dashboard/carreras", icon: GraduationCap, roles: ["ADMIN", "ADMINISTRATIVO"] },
    ],
  },
  {
    group: "Gestión Académica",
    items: [
      { name: "Ciclos Lectivos", href: "/dashboard/ciclos", icon: Calendar, roles: ["ADMIN", "ADMINISTRATIVO"] },
      { name: "Mesas de Examen", href: "/dashboard/mesas-examen", icon: ClipboardCheck, roles: ["ADMIN", "ADMINISTRATIVO"] },
      { name: "Mis Clases", href: "/dashboard/mis-comisiones", icon: ClipboardList, roles: ["PROFESOR"] },
      { name: "Mis Mesas de Examen", href: "/dashboard/mis-mesas", icon: ClipboardCheck, roles: ["PROFESOR"] },
    ],
  },
  {
    group: "Personas",
    items: [
      { name: "Estudiantes", href: "/dashboard/alumnos", icon: Users, roles: ["ADMIN", "ADMINISTRATIVO"] },
      { name: "Profesores", href: "/dashboard/profesores", icon: Users, roles: ["ADMIN", "ADMINISTRATIVO"] },
      { name: "Administradores", href: "/dashboard/administradores", icon: ShieldCheck, roles: ["ADMIN"] },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => user?.role && item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0)

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

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {filteredNavigation.map((section) => (
          <div key={section.group ?? "root"} className="space-y-1">
            {section.group && !collapsed && (
              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.group}
              </p>
            )}
            {section.items.map((item) => {
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
