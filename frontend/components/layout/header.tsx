"use client"

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
import { LogOut, User, ChevronRight, Repeat } from "lucide-react"
import { navigation } from "@/components/layout/sidebar"
import { useAuth } from "@/hooks/use-auth"

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
  const { user, switchRole, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handleSwitchRole = (rol: string) => {
    switchRole(rol)
    router.push("/dashboard")
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

  if (!user) {
    return <header className="h-[65px] border-b border-border bg-card/60 backdrop-blur-xl" />
  }

  const otrosRoles = (user.roles ?? []).filter((rol) => rol !== user.role)

  return (
    <header className="border-b border-border bg-card/60 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Backoffice</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{sectionLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getRoleBadgeVariant(user.role)} className="hidden sm:inline-flex">
            {user.role}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-accent">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(user.nombres ?? "", user.apellido ?? "")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">
                  {user.nombres} {user.apellido}
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
              {otrosRoles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
                  {otrosRoles.map((rol) => (
                    <DropdownMenuItem key={rol} onClick={() => handleSwitchRole(rol)}>
                      <Repeat className="mr-2 size-4" />
                      Modo: {rol}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
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
