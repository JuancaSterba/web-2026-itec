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
import { desactivarCarrera, type Carrera } from "@/lib/services/carreras.service"

interface EliminarCarreraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carrera: Carrera | null
  onSuccess: (id: number) => void
}

export function EliminarCarreraDialog({ open, onOpenChange, carrera, onSuccess }: EliminarCarreraDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!carrera) return
    setSubmitting(true)
    try {
      await desactivarCarrera(carrera.id)
      toast.success("Carrera desactivada correctamente")
      onSuccess(carrera.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar la carrera")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar carrera</DialogTitle>
          <DialogDescription>
            {carrera && (
              <>
                ¿Seguro que querés desactivar <strong>{carrera.nombre}</strong>? No vas a poder reactivarla desde
                esta pantalla.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
