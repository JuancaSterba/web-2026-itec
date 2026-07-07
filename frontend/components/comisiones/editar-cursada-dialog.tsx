"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Pencil } from "lucide-react"
import { updateCursada } from "@/app/actions/cursada-actions"
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

interface CursadaEditable {
  id: number
  alumnoId: number
  comisionId: number
  condicionFinal: string
  notaCierre: number | null
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function EditarCursadaDialog({ cursada }: { cursada: CursadaEditable }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateCursada(formData, cursada.id, cursada.alumnoId, cursada.comisionId)
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
          <DialogTitle>Editar Cursada</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condicionFinal">Condición Final</Label>
            <Input
              id="condicionFinal"
              name="condicionFinal"
              defaultValue={cursada.condicionFinal}
              placeholder="REGULAR / PROMOCIONADO / LIBRE"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notaCierre">Nota de Cierre</Label>
            <Input
              id="notaCierre"
              name="notaCierre"
              type="number"
              min={0}
              max={10}
              step={0.5}
              defaultValue={cursada.notaCierre ?? ""}
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
