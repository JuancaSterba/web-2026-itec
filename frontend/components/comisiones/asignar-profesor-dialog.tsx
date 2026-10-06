"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { createComisionProfesor } from "@/app/actions/comision-profesor-actions"
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
import { ProfesorFormDialog } from "@/components/profesores/profesor-form-dialog"

interface ProfesorDisponible {
  id: number
  nombre: string
  apellido: string
  dni: string
}

function BotonGuardar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Asignando..." : "Asignar"}
    </Button>
  )
}

export default function AsignarProfesorDialog({
  comisionId,
  profesoresDisponibles,
}: {
  comisionId: number
  profesoresDisponibles: ProfesorDisponible[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showCrearProfesor, setShowCrearProfesor] = useState(false)
  const [profesoresCreados, setProfesoresCreados] = useState<ProfesorDisponible[]>([])
  const [selectedProfesorId, setSelectedProfesorId] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)

  const todosLosProfesores = [
    ...profesoresDisponibles,
    ...profesoresCreados.filter((pc) => !profesoresDisponibles.some((pd) => pd.id === pc.id)),
  ]

  async function handleSubmit(formData: FormData) {
    await createComisionProfesor(formData, comisionId)
    formRef.current?.reset()
    setSelectedProfesorId("")
    setOpen(false)
  }

  function handleProfesorCreado(nuevoProfesor: ProfesorDisponible) {
    setProfesoresCreados((prev) => [...prev, nuevoProfesor])
    setSelectedProfesorId(nuevoProfesor.id.toString())
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={todosLosProfesores.length === 0}
            title={todosLosProfesores.length === 0 ? "No hay profesores disponibles para asignar" : undefined}
          >
            <Plus className="size-4" />
            Asignar Profesor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Profesor a la Comisión</DialogTitle>
          </DialogHeader>
          <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profesorId">Profesor</Label>
              <select
                id="profesorId"
                name="profesorId"
                required
                value={selectedProfesorId}
                onChange={(e) => setSelectedProfesorId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccioná un profesor</option>
                {todosLosProfesores.map((profesor) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido} — DNI {profesor.dni}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setShowCrearProfesor(true)}
              >
                + Crear profesor nuevo
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Input id="rol" name="rol" placeholder="Titular" />
            </div>
            <DialogFooter>
              <BotonGuardar />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ProfesorFormDialog
        open={showCrearProfesor}
        onOpenChange={(nuevoOpen) => {
          setShowCrearProfesor(nuevoOpen)
          if (!nuevoOpen) router.refresh()
        }}
        profesor={null}
        onProfesorCreated={handleProfesorCreado}
      />
    </>
  )
}
