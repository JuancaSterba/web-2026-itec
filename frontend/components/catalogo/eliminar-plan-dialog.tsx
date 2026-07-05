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
import { desactivarPlanEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

interface EliminarPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanEstudio | null
  onSuccess: (id: number) => void
}

export function EliminarPlanDialog({ open, onOpenChange, plan, onSuccess }: EliminarPlanDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!plan) return
    setSubmitting(true)
    try {
      await desactivarPlanEstudio(plan.id)
      toast.success("Plan de estudio desactivado correctamente")
      onSuccess(plan.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar el plan de estudio")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar plan de estudio</DialogTitle>
          <DialogDescription>
            {plan && (
              <>
                ¿Seguro que querés desactivar <strong>{plan.validez}</strong> ({plan.carreraNombre})? No vas a poder
                reactivarlo desde esta pantalla.
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
