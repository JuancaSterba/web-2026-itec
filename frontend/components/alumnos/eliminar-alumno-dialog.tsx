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
import { deleteAlumno } from "@/app/actions/alumno-actions"
import type { Alumno } from "@/lib/services/alumnos.service"

interface EliminarAlumnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alumno: Alumno | null
}

export function EliminarAlumnoDialog({ open, onOpenChange, alumno }: EliminarAlumnoDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!alumno) return
    setSubmitting(true)
    try {
      await deleteAlumno(alumno.id)
      toast.success("Alumno eliminado correctamente")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el alumno")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar alumno</DialogTitle>
          <DialogDescription>
            {alumno && (
              <>
                ¿Seguro que querés eliminar a <strong>{alumno.nombre} {alumno.apellido}</strong> (legajo{" "}
                {alumno.legajo})? Esta acción no se puede deshacer.
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
