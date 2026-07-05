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
import { eliminarCuatrimestre, type Cuatrimestre } from "@/lib/services/cuatrimestres.service"

interface EliminarCuatrimestreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuatrimestre: Cuatrimestre | null
  onSuccess: (id: number) => void
}

export function EliminarCuatrimestreDialog({
  open,
  onOpenChange,
  cuatrimestre,
  onSuccess,
}: EliminarCuatrimestreDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!cuatrimestre) return
    setSubmitting(true)
    try {
      await eliminarCuatrimestre(cuatrimestre.id)
      toast.success("Cuatrimestre eliminado correctamente")
      onSuccess(cuatrimestre.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el cuatrimestre")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar cuatrimestre</DialogTitle>
          <DialogDescription>
            {cuatrimestre && (
              <>
                ¿Seguro que querés eliminar <strong>{cuatrimestre.anio} - {cuatrimestre.numero}°</strong>? A
                diferencia de Carrera/Plan/Materia, esta es una eliminación física y no se puede deshacer.
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
