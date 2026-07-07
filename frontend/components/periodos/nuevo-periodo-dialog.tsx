"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createPeriodo } from "@/app/actions/periodo-actions"
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

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function NuevoPeriodoDialog({ cicloId }: { cicloId: number }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createPeriodo(formData, cicloId)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo Período
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Período Académico</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="Primer Cuatrimestre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
            <Input id="fechaInicio" name="fechaInicio" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin</Label>
            <Input id="fechaFin" name="fechaFin" type="date" />
          </div>
          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
