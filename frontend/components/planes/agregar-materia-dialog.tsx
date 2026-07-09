"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { Plus } from "lucide-react"
import { createMateriaPlan } from "@/app/actions/materia-plan-actions"
import { createMateria } from "@/app/actions/materia-actions"
import { calcularCuatrimestreDictado } from "@/lib/cuatrimestre-carrera"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

const OPCION_NUEVA_MATERIA = "__crear_nueva__"

interface MateriaDisponible {
  id: number
  nombre: string
}

interface CorrelativaDisponible {
  id: number
  materiaNombre: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}

export default function AgregarMateriaDialog({
  planId,
  materiasDisponibles,
  correlativasDisponibles,
}: {
  planId: number
  materiasDisponibles: MateriaDisponible[]
  correlativasDisponibles: CorrelativaDisponible[]
}) {
  const [open, setOpen] = useState(false)
  const [correlativasElegidas, setCorrelativasElegidas] = useState<Set<number>>(new Set())
  const [materias, setMaterias] = useState(materiasDisponibles)
  const [materiaId, setMateriaId] = useState("")
  const [creandoMateria, setCreandoMateria] = useState(false)
  const [nombreNueva, setNombreNueva] = useState("")
  const [codigoNueva, setCodigoNueva] = useState("")
  const [errorNueva, setErrorNueva] = useState<string | null>(null)
  const [guardandoNueva, setGuardandoNueva] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function toggleCorrelativa(id: number) {
    setCorrelativasElegidas((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  function handleSelectMateria(value: string) {
    if (value === OPCION_NUEVA_MATERIA) {
      setCreandoMateria(true)
      setErrorNueva(null)
      return
    }
    setMateriaId(value)
    if (creandoMateria) cancelarNuevaMateria()
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) cancelarNuevaMateria()
  }

  function cancelarNuevaMateria() {
    setCreandoMateria(false)
    setNombreNueva("")
    setCodigoNueva("")
    setErrorNueva(null)
  }

  async function handleCrearMateria() {
    if (!nombreNueva.trim()) {
      setErrorNueva("El nombre es obligatorio")
      return
    }
    setGuardandoNueva(true)
    setErrorNueva(null)
    try {
      const formData = new FormData()
      formData.set("nombre", nombreNueva.trim())
      formData.set("codigoInterno", codigoNueva.trim())
      const nueva = await createMateria(formData)
      setMaterias((prev) => [...prev, { id: nueva.id, nombre: nueva.nombre }])
      setMateriaId(String(nueva.id))
      cancelarNuevaMateria()
    } catch (e) {
      setErrorNueva(e instanceof Error ? e.message : "No se pudo crear la materia")
    } finally {
      setGuardandoNueva(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    const anio = Number(formData.get("anio"))
    const cuatrimestreDelAnio = Number(formData.get("cuatrimestreDelAnio"))
    formData.set("cuatrimestreDictado", String(calcularCuatrimestreDictado(anio, cuatrimestreDelAnio)))
    correlativasElegidas.forEach((id) => formData.append("correlativaIds", String(id)))

    await createMateriaPlan(formData, planId)
    formRef.current?.reset()
    setCorrelativasElegidas(new Set())
    setMateriaId("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Agregar Materia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Materia al Plan</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materiaId">Materia</Label>
            <select
              id="materiaId"
              name="materiaId"
              required
              value={materiaId}
              onChange={(e) => handleSelectMateria(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccioná una materia</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
              <option value={OPCION_NUEVA_MATERIA}>+ Crear materia nueva...</option>
            </select>
            {creandoMateria && (
              <div className="space-y-2 rounded-md border border-border p-3">
                <div className="space-y-2">
                  <Label htmlFor="nombreNuevaMateria">Nombre de la materia nueva</Label>
                  <Input
                    id="nombreNuevaMateria"
                    value={nombreNueva}
                    onChange={(e) => setNombreNueva(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoNuevaMateria">Código Interno</Label>
                  <Input
                    id="codigoNuevaMateria"
                    value={codigoNueva}
                    onChange={(e) => setCodigoNueva(e.target.value)}
                  />
                </div>
                {errorNueva && <p className="text-sm text-destructive">{errorNueva}</p>}
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={guardandoNueva} onClick={handleCrearMateria}>
                    {guardandoNueva ? "Creando..." : "Crear y seleccionar"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={cancelarNuevaMateria}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año de la Carrera</Label>
              <Input id="anio" name="anio" type="number" min={1} placeholder="Ej: 2" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuatrimestreDelAnio">Cuatrimestre del Año</Label>
              <select
                id="cuatrimestreDelAnio"
                name="cuatrimestreDelAnio"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="1">1º Cuatrimestre</option>
                <option value="2">2º Cuatrimestre</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargaHoraria">Carga Horaria Semanal</Label>
            <Input id="cargaHoraria" name="cargaHoraria" type="number" min={1} placeholder="Horas por semana" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modalidadEvaluacion">Modalidad de Evaluación</Label>
            <select
              id="modalidadEvaluacion"
              name="modalidadEvaluacion"
              defaultValue="FINAL"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="FINAL">Final (requiere examen final)</option>
              <option value="PROMOCIONAL">Promocional (puede promocionar sin final)</option>
            </select>
          </div>
          {correlativasDisponibles.length > 0 && (
            <div className="space-y-2">
              <Label>Correlativas (materias que hay que tener aprobadas antes)</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {correlativasDisponibles.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={correlativasElegidas.has(c.id)}
                      onCheckedChange={() => toggleCorrelativa(c.id)}
                    />
                    <span className="flex-1">{c.materiaNombre}</span>
                  </label>
                ))}
              </div>
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
