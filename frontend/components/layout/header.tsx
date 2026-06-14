"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

export default function Header() {
  const router = useRouter()
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

  if (!mounted) {
    return (
      <header className="border-b bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Cargando...</h1>
        </div>
      </header>
    )
  }

  const handleLogout = () => {
    // limpiar storage
    localStorage.clear()
    // borrar cookie (mismos atributos con los que fue creada)
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

  return (
    <header className="border-b bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Bienvenido/a, {userData.nombres} {userData.apellido}
        </h1>

        <div className="flex items-center space-x-4">
          <Badge variant={getRoleBadgeVariant(userData.role)}>
            <span className="hidden md:inline">ROL: {userData.role}</span>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Usuario: {userData.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
