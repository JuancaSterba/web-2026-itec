"use client"

import { createContext, useCallback, useContext, useMemo } from "react"
import { toast } from "sonner"
import type { UsuarioActual } from "@/lib/auth-server"
import { loginAction, logoutAction, seleccionarRolAction } from "@/app/actions/auth-actions"

// La sesion la lee el servidor (cookies httpOnly) y llega por props desde el
// layout raiz. En el navegador no se guarda nada: ni token, ni datos
// personales, ni rol activo (RF-02).
export type AuthUser = {
  username: string
  role: string
  roles: string[]
  nombres?: string
  apellido?: string
}

type AuthContextType = {
  user: AuthUser | null
  // Puente hasta T22, cuando el formulario de login use loginAction directo.
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchRole: (rol: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function aAuthUser(usuario: UsuarioActual | null): AuthUser | null {
  if (!usuario) return null
  return {
    username: usuario.username,
    role: usuario.rolActivo ?? "",
    roles: usuario.roles,
    nombres: usuario.nombre ?? undefined,
    apellido: usuario.apellido ?? undefined,
  }
}

export const AuthProvider = ({
  usuario = null,
  children,
}: {
  usuario?: UsuarioActual | null
  children: React.ReactNode
}) => {
  const user = useMemo(() => aAuthUser(usuario), [usuario])

  const login = useCallback(async (username: string, password: string) => {
    const formData = new FormData()
    formData.set("username", username)
    formData.set("password", password)
    const resultado = await loginAction({ error: null }, formData)
    if (resultado?.error) throw new Error(resultado.error)
  }, [])

  // Las Server Actions borran o escriben las cookies y redirigen.
  const logout = useCallback(async () => {
    await logoutAction() // RF-15, RF-23
  }, [])

  const switchRole = useCallback(async (rol: string) => {
    const resultado = await seleccionarRolAction(rol) // RF-08
    if (resultado?.error) toast.error(resultado.error) // RF-09, RF-22
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
