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
import { eliminarComision, type Comision } from "@/lib/services/comisiones.service"

interface EliminarComisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comision: Comision | null
  onSuccess: (id: number) => void
}

export function EliminarComisionDialog({ open, onOpenChange, comision, onSuccess }: EliminarComisionDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!comision) return
    setSubmitting(true)
    try {
      await eliminarComision(comision.id)
      toast.success("Comisión eliminada correctamente")
      onSuccess(comision.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar la comisión")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar comisión</DialogTitle>
          <DialogDescription>
            {comision && (
              <>
                ¿Seguro que querés eliminar <strong>{comision.nombre}</strong> ({comision.materiaNombre})?
                Esta acción no se puede deshacer.
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
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
