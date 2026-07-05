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
import { desactivarMateria, type Materia } from "@/lib/services/materias.service"

interface EliminarMateriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materia: Materia | null
  onSuccess: (id: number) => void
}

export function EliminarMateriaDialog({ open, onOpenChange, materia, onSuccess }: EliminarMateriaDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!materia) return
    setSubmitting(true)
    try {
      await desactivarMateria(materia.id)
      toast.success("Materia desactivada correctamente")
      onSuccess(materia.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar la materia")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar materia</DialogTitle>
          <DialogDescription>
            {materia && (
              <>
                ¿Seguro que querés desactivar <strong>{materia.nombre}</strong>? No vas a poder reactivarla desde
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
