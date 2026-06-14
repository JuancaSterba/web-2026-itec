"use client"

import { useRouter } from "next/navigation"
import { useCallback, createContext, useContext, useEffect, useState } from "react"
import { useLocalStorage } from "react-use"
import { jwtDecode } from "jwt-decode"
import { LoginRequest } from "@/types/LoginRequest"
import { LoginResponse } from "@/types/LoginResponse"
import apiClient from "@/lib/api-client"

export type AuthUser = {
  username: string
  role: string
  nombres?: string
  apellido?: string
  dni?: string
  email?: string
  telefono?: string
}

type AuthContextType = {
  token: string | null
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useLocalStorage<string | null>("token", null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  // Carga inicial desde localStorage (tu lógica)
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem("token")
      const storedRole = localStorage.getItem("user-role")
      const storedUsername = localStorage.getItem("username")

      if (storedToken && storedRole && storedUsername) {
        setUser({
          username: storedUsername,
          role: storedRole,
          nombres: localStorage.getItem("nombres") || undefined,
          apellido: localStorage.getItem("apellido") || undefined,
          dni: localStorage.getItem("dni") || undefined,
          email: localStorage.getItem("email") || undefined,
          telefono: localStorage.getItem("telefono") || undefined,
        })
      } else {
        setUser(null)
      }
    }

    loadUserFromStorage()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-role" || e.key === "token") loadUserFromStorage()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // LOGIN: API -> token -> cookie + storage -> flujo de roles
  const login = useCallback(
    async (username: string, password: string) => {
      const payload: LoginRequest = { username, password }
      const response = await apiClient.post<LoginResponse[]>("/auth/login", payload)

      if (!response.data || response.data.length === 0) {
        throw new Error("Token no recibido")
      }

      const receivedToken = response.data[0].token
      if (!receivedToken) throw new Error("Token vacío")

      // Guardar token
      setToken(receivedToken)
      localStorage.setItem("token", receivedToken)

      // 👇 CLAVE: cookie que ve tu middleware/SSR
      document.cookie = `auth-token=${encodeURIComponent(receivedToken)}; Path=/; SameSite=Lax`

      // Decodificar datos
      const decoded: any = jwtDecode(receivedToken)
      const roles: string[] = decoded?.roles || []
      const datos = decoded?.datos_personales || {}

      localStorage.setItem("username", decoded?.username || "")
      localStorage.setItem("nombres", datos?.nombre || "")
      localStorage.setItem("apellido", datos?.apellido || "Desconocido")
      localStorage.setItem("dni", datos?.dni || "Desconocido")
      localStorage.setItem("email", datos?.email || "Desconocido")
      localStorage.setItem("telefono", datos?.telefono || "Desconocido")
      localStorage.setItem("roles", JSON.stringify(roles))

      if (roles.length > 1) {
        localStorage.setItem("pending-roles", JSON.stringify(roles))
        router.replace("/seleccionar-rol")
      } else {
        const role = roles[0] || ""
        localStorage.setItem("user-role", role)
        setUser({
          username: decoded?.username || "",
          role,
          nombres: datos?.nombre || "",
          apellido: datos?.apellido || "Desconocido",
          dni: datos?.dni || "Desconocido",
          email: datos?.email || "Desconocido",
          telefono: datos?.telefono || "Desconocido",
        })
        router.replace("/dashboard")
      }
    },
    [setToken, router]
  )

  // LOGOUT: borrar cookie + storage
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)

    // Borrar cookie con los mismos atributos usados al crearla
    document.cookie = "auth-token=; Path=/; Max-Age=0; SameSite=Lax"

    localStorage.clear()
    router.replace("/login")
  }, [setToken, router])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
