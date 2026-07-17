"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { ClipboardCheck } from "lucide-react"
import { toast } from "sonner"
import { saveAsistenciasMasivas } from "@/app/actions/asistencia-actions"
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

interface CursadaParaAsistencia {
  id: number
  alumnoNombre: string
}

interface AsistenciaExistente {
  cursadaId: number
  fecha: string
  id: number
}

const ESTADOS = ["PRESENTE", "AUSENTE", "TARDANZA"]

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar Asistencia"}
    </Button>
  )
}

export default function TomarAsistenciaDialog({
  comisionId,
  cursadas,
  asistenciasExistentes,
}: {
  comisionId: number
  cursadas: CursadaParaAsistencia[]
  asistenciasExistentes: AsistenciaExistente[]
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const hoy = new Date().toISOString().slice(0, 10)

  async function handleSubmit(formData: FormData) {
    const fecha = formData.get("fecha") as string
    const registros = cursadas.map((cursada) => {
      const existente = asistenciasExistentes.find(
        (a) => a.cursadaId === cursada.id && a.fecha === fecha
      )
      return {
        cursadaId: cursada.id,
        estado: (formData.get(`estado_${cursada.id}`) as string) ?? "PRESENTE",
        asistenciaId: existente?.id,
      }
    })

    try {
      await saveAsistenciasMasivas(comisionId, fecha, registros)
      formRef.current?.reset()
      setOpen(false)
      toast.success("Asistencia guardada correctamente")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={cursadas.length === 0}
          title={cursadas.length === 0 ? "No hay alumnos inscriptos en esta comisión" : undefined}
        >
          <ClipboardCheck className="size-4" />
          Tomar Asistencia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tomar Asistencia</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" defaultValue={hoy} required />
          </div>

          {cursadas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay alumnos inscritos en esta comisión.</p>
          ) : (
            <div className="space-y-2">
              {cursadas.map((cursada) => (
                <div key={cursada.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">{cursada.alumnoNombre}</span>
                  <select
                    name={`estado_${cursada.id}`}
                    defaultValue="PRESENTE"
                    className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
