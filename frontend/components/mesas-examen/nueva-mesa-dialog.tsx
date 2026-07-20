"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createMesaExamen } from "@/app/actions/mesa-examen-actions"
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
import SelectMateriaBuscable from "@/components/materias/select-materia-buscable"

interface MateriaDisponible {
  id: number
  nombre: string
}

interface CicloDisponible {
  id: number
  anio: number
}

interface ProfesorDisponible {
  userId: number
  nombre: string
  apellido: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando..." : "Crear Mesa"}
    </Button>
  )
}

export default function NuevaMesaDialog({
  materiasDisponibles,
  ciclosDisponibles,
  profesoresDisponibles,
}: {
  materiasDisponibles: MateriaDisponible[]
  ciclosDisponibles: CicloDisponible[]
  profesoresDisponibles: ProfesorDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [materiaPlanId, setMateriaPlanId] = useState("")
  const [tipoMesa, setTipoMesa] = useState<"ORDINARIA" | "ESPECIAL">("ORDINARIA")
  const formRef = useRef<HTMLFormElement>(null)

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) {
      setMateriaPlanId("")
      setTipoMesa("ORDINARIA")
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!materiaPlanId) {
      toast.error("Seleccioná una materia")
      return
    }

    const tribunalIds = profesoresDisponibles
      .filter((profesor) => formData.get(`tribunal_${profesor.userId}`) === "on")
      .map((profesor) => profesor.userId)

    const hora = formData.get("hora") as string

    try {
      await createMesaExamen({
        materiaPlanId: Number(formData.get("materiaPlanId")),
        cicloLectivoId: Number(formData.get("cicloLectivoId")),
        turno: tipoMesa === "ORDINARIA" ? (formData.get("turno") as string) : null,
        tipoMesa,
        fechaHora1erLlamado: formData.get("fecha1erLlamado") ? `${formData.get("fecha1erLlamado")}T${hora}:00` : undefined,
        fechaHora2doLlamado: formData.get("fecha2doLlamado") ? `${formData.get("fecha2doLlamado")}T${hora}:00` : undefined,
        fechaHoraEspecial: formData.get("fechaEspecial") ? `${formData.get("fechaEspecial")}T${hora}:00` : undefined,
        tribunalIds,
      })
      formRef.current?.reset()
      setMateriaPlanId("")
      setTipoMesa("ORDINARIA")
      setOpen(false)
      toast.success("Mesa de examen creada correctamente")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la mesa de examen")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Crear Mesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Mesa de Examen</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="tipoMesa">Tipo de Mesa</Label>
            <select
              id="tipoMesa"
              value={tipoMesa}
              onChange={(e) => setTipoMesa(e.target.value as "ORDINARIA" | "ESPECIAL")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ORDINARIA">Ordinaria (con 1er y 2do Llamado)</option>
              <option value="ESPECIAL">Especial (único llamado)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materiaPlanId">Materia</Label>
            <SelectMateriaBuscable
              id="materiaPlanId"
              name="materiaPlanId"
              materias={materiasDisponibles}
              value={materiaPlanId}
              onValueChange={setMateriaPlanId}
              placeholder="Seleccioná una materia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cicloLectivoId">Ciclo Lectivo</Label>
              <select
                id="cicloLectivoId"
                name="cicloLectivoId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccionar</option>
                {ciclosDisponibles.map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.anio}
                  </option>
                ))}
              </select>
            </div>

            {tipoMesa === "ORDINARIA" && (
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <select
                  id="turno"
                  name="turno"
                  required={tipoMesa === "ORDINARIA"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleccionar</option>
                  <option value="PRIMER_TURNO">1er Turno (Feb/Marzo)</option>
                  <option value="SEGUNDO_TURNO">2do Turno (Julio)</option>
                  <option value="TERCER_TURNO">3er Turno (Nov/Dic)</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hora">Hora del Examen</Label>
            <Input id="hora" name="hora" type="time" required />
          </div>

          {tipoMesa === "ORDINARIA" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha1erLlamado">Fecha 1er Llamado</Label>
                <Input id="fecha1erLlamado" name="fecha1erLlamado" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha2doLlamado">Fecha 2do Llamado</Label>
                <Input id="fecha2doLlamado" name="fecha2doLlamado" type="date" required />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fechaEspecial">Fecha</Label>
              <Input id="fechaEspecial" name="fechaEspecial" type="date" required />
            </div>
          )}

          <div className="space-y-2">
            <Label>Tribunal Docente</Label>
            {profesoresDisponibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay profesores registrados.</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-input p-2">
                {profesoresDisponibles.map((profesor) => (
                  <label
                    key={profesor.userId}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    <input type="checkbox" name={`tribunal_${profesor.userId}`} className="size-4" />
                    {profesor.apellido}, {profesor.nombre}
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <BotonGuardar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
