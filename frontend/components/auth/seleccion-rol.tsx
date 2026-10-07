"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { seleccionarRolAction } from "@/app/actions/auth-actions"

// Con un rol valido, seleccionarRolAction guarda la cookie y redirige al
// panel; solo vuelve con error si el rol no esta asignado (RF-09, RF-22).
export function SeleccionRol({ roles }: { roles: string[] }) {
  const [error, setError] = useState<string | null>(null)
  const [rolElegido, setRolElegido] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const elegir = (rol: string) => {
    setError(null)
    setRolElegido(rol)
    startTransition(async () => {
      const resultado = await seleccionarRolAction(rol)
      if (resultado?.error) setError(resultado.error)
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {roles.map((rol) => (
        <Button key={rol} className="w-full" disabled={isPending} onClick={() => elegir(rol)}>
          {isPending && rolElegido === rol && <Loader2 className="size-4 animate-spin" />}
          {rol}
        </Button>
      ))}
    </div>
  )
}
