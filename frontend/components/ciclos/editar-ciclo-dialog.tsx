"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateCiclo } from "@/app/actions/ciclo-actions"
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

interface CicloEditable {
  id: number
  anio: number
  fechaInicio: string
  fechaFin: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarCicloDialog({ ciclo }: { ciclo: CicloEditable }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateCiclo(ciclo.id, formData)
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
          <DialogTitle>Editar Ciclo Lectivo</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anio">Año</Label>
            <Input id="anio" name="anio" type="number" defaultValue={ciclo.anio} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input id="fechaInicio" name="fechaInicio" type="date" defaultValue={ciclo.fechaInicio} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input id="fechaFin" name="fechaFin" type="date" defaultValue={ciclo.fechaFin} />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
