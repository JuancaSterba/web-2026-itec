"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

export default function SeleccionarRolPage() {
  const [roles, setRoles] = useState<string[]>([])
  const [error, setError] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    const storedRoles = localStorage.getItem("pending-roles")
    if (storedRoles) {
      try {
        const parsed = JSON.parse(storedRoles)
        if (Array.isArray(parsed)) {
          setRoles(parsed)
        } else {
          setError("Los roles no son válidos.")
        }
      } catch {
        setError("No se pudieron leer los roles.")
      }
    } else {
      setError("No hay roles disponibles.")
    }
  }, [])

  const handleRoleSelect = (rol: string) => {
    // Guardar rol seleccionado
    localStorage.setItem("user-role", rol)
    localStorage.removeItem("pending-roles")

    // Actualizar contexto
    setUser({
      username: localStorage.getItem("username") || "",
      role: rol,
      nombres: localStorage.getItem("nombres") || undefined,
      apellido: localStorage.getItem("apellido") || undefined,
      dni: localStorage.getItem("dni") || undefined,
      email: localStorage.getItem("email") || undefined,
      telefono: localStorage.getItem("telefono") || undefined,
    })

    router.push("/dashboard")
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-center">Seleccioná tu rol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((rol) => (
          <Button key={rol} className="w-full" onClick={() => handleRoleSelect(rol)}>
            {rol}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
