"use client"

import { useMemo, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createComisionesMasivas } from "@/app/actions/comision-actions"
import { etiquetaCuatrimestre } from "@/lib/cuatrimestre-carrera"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PlanDisponible {
  id: number
  etiqueta: string
}

interface MateriaPlanDisponible {
  id: number
  planEstudioId: number
  materiaNombre: string
  cuatrimestreDictado: number
}

function BotonGuardar({ cantidad }: { cantidad: number }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || cantidad === 0}>
      {pending ? "Creando..." : `Crear ${cantidad} Comisión${cantidad === 1 ? "" : "es"}`}
    </Button>
  )
}

export default function AgregarComisionesPorCarreraDialog({
  periodoId,
  planesDisponibles,
  materiasPlan,
  materiaPlanIdsYaOfertados,
}: {
  periodoId: number
  planesDisponibles: PlanDisponible[]
  materiasPlan: MateriaPlanDisponible[]
  materiaPlanIdsYaOfertados: number[]
}) {
  const planPorDefecto = planesDisponibles.length > 0 ? String(planesDisponibles[0].id) : ""

  const [open, setOpen] = useState(false)
  const [planEstudioId, setPlanEstudioId] = useState(planPorDefecto)
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())
  const [cupoMaximo, setCupoMaximo] = useState("30")

  const yaOfertadas = useMemo(() => new Set(materiaPlanIdsYaOfertados), [materiaPlanIdsYaOfertados])

  const materiasDelPlan = useMemo(() => {
    if (!planEstudioId) return []
    return materiasPlan
      .filter((mp) => String(mp.planEstudioId) === planEstudioId)
      .sort((a, b) => a.cuatrimestreDictado - b.cuatrimestreDictado)
  }, [materiasPlan, planEstudioId])

  function toggleMateria(id: number) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  function cerrarYResetear() {
    setOpen(false)
    setPlanEstudioId(planPorDefecto)
    setSeleccionadas(new Set())
    setCupoMaximo("30")
  }

  async function handleSubmit() {
    const seleccion = materiasDelPlan
      .filter((mp) => seleccionadas.has(mp.id))
      .map((mp) => ({ materiaPlanId: mp.id, nombreComision: mp.materiaNombre }))

    if (seleccion.length === 0) return

    await createComisionesMasivas(periodoId, seleccion, Number(cupoMaximo))
    cerrarYResetear()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : cerrarYResetear())}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Agregar Materias de una Carrera
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Materias de una Carrera a este Período</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {planesDisponibles.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="planEstudioId">Carrera</Label>
              <select
                id="planEstudioId"
                value={planEstudioId}
                onChange={(e) => {
                  setPlanEstudioId(e.target.value)
                  setSeleccionadas(new Set())
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccioná una carrera</option>
                {planesDisponibles.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Carrera: <span className="font-medium text-foreground">{planesDisponibles[0]?.etiqueta ?? "—"}</span>
            </p>
          )}

          {planEstudioId && (
            <div className="space-y-2">
              <Label>Materias del Plan (todos los cuatrimestres)</Label>
              {materiasDelPlan.length === 0 ? (
                <p className="text-sm text-muted-foreground">Esta carrera no tiene materias en su malla.</p>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                  {materiasDelPlan.map((mp) => {
                    const yaOfertada = yaOfertadas.has(mp.id)
                    return (
                      <label
                        key={mp.id}
                        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                          yaOfertada ? "opacity-50" : "hover:bg-accent"
                        }`}
                      >
                        <Checkbox
                          checked={seleccionadas.has(mp.id)}
                          disabled={yaOfertada}
                          onCheckedChange={() => toggleMateria(mp.id)}
                        />
                        <span className="flex-1">
                          {mp.materiaNombre}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({etiquetaCuatrimestre(mp.cuatrimestreDictado)}{yaOfertada ? " · ya ofertada" : ""})
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cupoMaximo">Cupo Máximo (para todas las comisiones creadas)</Label>
            <Input
              id="cupoMaximo"
              type="number"
              min={1}
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(e.target.value)}
            />
          </div>

          <DialogFooter>
            <BotonGuardar cantidad={seleccionadas.size} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
