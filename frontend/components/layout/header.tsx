"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronRight } from "lucide-react"
import { navigation } from "@/components/layout/sidebar"

function getSectionLabel(pathname: string) {
  const exact = navigation.find((item) => item.href === pathname)
  if (exact) return exact.name

  const parent = navigation
    .filter((item) => item.href !== "/dashboard" && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]

  return parent?.name ?? "Inicio"
}

function getInitials(nombres: string, apellido: string) {
  const a = nombres?.trim()?.[0] ?? ""
  const b = apellido?.trim()?.[0] ?? ""
  return (a + b).toUpperCase() || "US"
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState({
    username: "",
    nombres: "",
    apellido: "",
    email: "",
    role: "",
  })

  useEffect(() => {
    setMounted(true)
    const activeRole = localStorage.getItem("user-role")
    const roles = JSON.parse(localStorage.getItem("roles") || "[]")
    const fallbackRole = roles.length > 0 ? roles[0] : "SIN ROL"

    setUserData({
      username: localStorage.getItem("username") || "Usuario",
      nombres: localStorage.getItem("nombres") || "Usuario",
      apellido: localStorage.getItem("apellido") || "Desconocido",
      email: localStorage.getItem("email") || "Desconocido",
      role: activeRole || fallbackRole,
    })
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = "auth-token=; Path=/; Max-Age=0; SameSite=Lax"
    router.push("/login")
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "ADMINISTRATIVO":
        return "secondary"
      case "ALUMNO":
        return "outline"
      case "PROFESOR":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const sectionLabel = getSectionLabel(pathname)

  if (!mounted) {
    return <header className="h-[65px] border-b border-border bg-card/60 backdrop-blur-xl" />
  }

  return (
    <header className="border-b border-border bg-card/60 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Backoffice</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{sectionLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getRoleBadgeVariant(userData.role)} className="hidden sm:inline-flex">
            {userData.role}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-accent">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(userData.nombres, userData.apellido)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">
                  {userData.nombres} {userData.apellido}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <User className="mr-2 size-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
