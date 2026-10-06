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
import { deleteProfesor } from "@/app/actions/profesor-actions"
import type { Profesor } from "@/lib/services/profesores.service"

interface EliminarProfesorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profesor: Profesor | null
}

export function EliminarProfesorDialog({ open, onOpenChange, profesor }: EliminarProfesorDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!profesor) return
    setSubmitting(true)
    try {
      await deleteProfesor(profesor.id)
      toast.success("Profesor eliminado correctamente")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el profesor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar profesor</DialogTitle>
          <DialogDescription>
            {profesor && (
              <>
                ¿Seguro que querés eliminar a <strong>{profesor.nombre} {profesor.apellido}</strong> ({profesor.titulo})?
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
