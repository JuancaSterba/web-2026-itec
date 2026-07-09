"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updatePlan } from "@/app/actions/plan-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PlanEditable {
  id: number
  cohorte: string
  resolucion: string
  fechaImplementacion: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarPlanDialog({ plan, carreraId }: { plan: PlanEditable; carreraId: number }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updatePlan(formData, plan.id, carreraId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Editar"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Plan de Estudio</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cohorte">Cohorte</Label>
            <Input id="cohorte" name="cohorte" defaultValue={plan.cohorte} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolucion">Resolución</Label>
            <Input id="resolucion" name="resolucion" defaultValue={plan.resolucion} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaImplementacion">Fecha de Implementación</Label>
            <Input
              id="fechaImplementacion"
              name="fechaImplementacion"
              type="date"
              defaultValue={plan.fechaImplementacion}
            />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
