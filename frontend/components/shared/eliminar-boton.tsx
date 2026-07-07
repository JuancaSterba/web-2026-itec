"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EliminarBoton({
  accion,
  entidadLabel,
  size = "icon",
}: {
  accion: () => Promise<void>
  entidadLabel: string
  size?: "icon" | "sm"
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Dar de baja "${entidadLabel}"?`)) return
    startTransition(() => {
      accion()
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "icon" ? "icon" : "sm"}
      disabled={isPending}
      onClick={handleClick}
      title="Dar de baja"
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  )
}
