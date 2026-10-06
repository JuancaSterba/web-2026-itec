"use client"

import { ShieldAlert } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface RequireRoleProps {
  roles: string[]
  children: React.ReactNode
}

// El backend ya rechaza estas acciones para roles no autorizados (403); esto
// es una segunda capa en el frontend para que un Profesor/Alumno que navegue
// directo por URL (el sidebar ya no le muestra el link) vea un mensaje claro
// en vez de una pantalla con botones que van a fallar.
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth()

  if (user && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-foreground">No tenés permiso para ver esta sección</p>
          <p className="text-sm text-muted-foreground">
            Esta pantalla es exclusiva para el rol {roles.join(" o ")}.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
