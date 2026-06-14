"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileText,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR", "ALUMNO"] },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Users, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Profesores", href: "/dashboard/profesores", icon: GraduationCap, roles: ["ADMIN"] },
  { name: "Materias", href: "/dashboard/materias", icon: BookOpen, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Comisiones", href: "/dashboard/comisiones", icon: Calendar, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Asistencias", href: "/dashboard/asistencias", icon: UserCheck, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR"] },
  { name: "Calificaciones", href: "/dashboard/calificaciones", icon: ClipboardCheck, roles: ["ADMIN", "ADMINISTRATIVO", "PROFESOR"], },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Certificados", href: "/dashboard/certificados", icon: FileText, roles: ["ADMIN", "ADMINISTRATIVO"] },
  { name: "Configuración", href: "/dashboard/configuraciones", icon: Settings, roles: ["ADMIN"] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <div className={cn("bg-white shadow-lg transition-all duration-300 ease-in-out", collapsed ? "w-16" : "w-64")}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">ITEC N°1</h2>
              <p className="text-sm text-gray-500">Backoffice</p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-2">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start", collapsed ? "px-2" : "px-4")}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
