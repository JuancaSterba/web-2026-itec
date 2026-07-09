"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateCarrera } from "@/app/actions/carrera-actions"
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

interface CarreraEditable {
  id: number
  nombre: string
  resolucionMinisterial: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarCarreraDialog({ carrera }: { carrera: CarreraEditable }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateCarrera(carrera.id, formData)
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
          <DialogTitle>Editar Carrera</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" defaultValue={carrera.nombre} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolucionMinisterial">Resolución Ministerial</Label>
            <Input
              id="resolucionMinisterial"
              name="resolucionMinisterial"
              defaultValue={carrera.resolucionMinisterial}
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
