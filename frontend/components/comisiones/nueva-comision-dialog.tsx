"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createComision } from "@/app/actions/comision-actions"
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

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function NuevaComisionDialog({
  periodoId,
  materiasPlanDisponibles,
}: {
  periodoId: number
  materiasPlanDisponibles: MateriaPlanDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createComision(formData, periodoId)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nueva Comisión
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Comisión</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreComision">Nombre</Label>
            <Input id="nombreComision" name="nombreComision" placeholder="Comisión A" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cupoMaximo">Cupo Máximo</Label>
            <Input id="cupoMaximo" name="cupoMaximo" type="number" min={1} placeholder="30" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="materiaPlanId">Materia</Label>
            <select
              id="materiaPlanId"
              name="materiaPlanId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccioná una materia</option>
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
