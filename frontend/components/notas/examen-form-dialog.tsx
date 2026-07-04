"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { crearExamen, type Examen } from "@/lib/services/notas.service"

interface ExamenFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comisionId: number
  onSuccess: (examen: Examen) => void
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function ExamenFormDialog({ open, onOpenChange, comisionId, onSuccess }: ExamenFormDialogProps) {
  const [nombre, setNombre] = useState("")
  const [fecha, setFecha] = useState(hoyISO())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setNombre("")
      setFecha(hoyISO())
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const creado = await crearExamen({ comisionId, nombre: nombre.trim(), fecha })
      toast.success("Examen creado correctamente")
      onSuccess(creado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo crear el examen"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo examen</DialogTitle>
          <DialogDescription>Se crea para la comisión seleccionada.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Primer Parcial"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Crear examen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
