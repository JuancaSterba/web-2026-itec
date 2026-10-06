"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateComision } from "@/app/actions/comision-actions"
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

interface MateriaPlanDisponible {
  id: number
  etiqueta: string
}

interface ComisionEditable {
  id: number
  nombreComision: string
  cupoMaximo: number
  materiaPlanId: number
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarComisionDialog({
  comision,
  periodoId,
  materiasPlanDisponibles,
}: {
  comision: ComisionEditable
  periodoId: number
  materiasPlanDisponibles: MateriaPlanDisponible[]
}) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateComision(formData, comision.id, periodoId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" title="Editar">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Comisión</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreComision">Nombre</Label>
            <Input id="nombreComision" name="nombreComision" defaultValue={comision.nombreComision} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cupoMaximo">Cupo Máximo</Label>
            <Input
              id="cupoMaximo"
              name="cupoMaximo"
              type="number"
              min={1}
              defaultValue={comision.cupoMaximo}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="materiaPlanId">Materia</Label>
            <select
              id="materiaPlanId"
              name="materiaPlanId"
              required
              defaultValue={comision.materiaPlanId}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {materiasPlanDisponibles.map((mp) => (
                <option key={mp.id} value={mp.id}>
                  {mp.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
