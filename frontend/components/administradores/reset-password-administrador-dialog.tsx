"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resetPasswordAdministrador, type Administrador } from "@/lib/services/administradores.service"

interface ResetPasswordAdministradorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  administrador: Administrador | null
  onSuccess: (administrador: Administrador) => void
}

export function ResetPasswordAdministradorDialog({
  open,
  onOpenChange,
  administrador,
  onSuccess,
}: ResetPasswordAdministradorDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleReset = async () => {
    if (!administrador) return
    setSubmitting(true)
    try {
      const actualizado = await resetPasswordAdministrador(administrador.id)
      toast.success("Contraseña reseteada correctamente", {
        description: `Nueva contraseña: ${administrador.dni}`,
      })
      onSuccess(actualizado)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo resetear la contraseña")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          <DialogDescription>
            {administrador && (
              <>
                La contraseña de <strong>{administrador.nombre} {administrador.apellido}</strong> va a
                volver a ser su DNI ({administrador.dni}). Esta acción no se puede deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleReset} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Resetear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
