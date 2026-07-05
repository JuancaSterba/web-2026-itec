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
import { actualizarProfesor, crearProfesor, type Profesor } from "@/lib/services/profesores.service"

interface ProfesorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profesor: Profesor | null
  onSuccess: (profesor: Profesor) => void
}

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  titulo: "",
  telefonoSecundario: "",
}

export function ProfesorFormDialog({ open, onOpenChange, profesor, onSuccess }: ProfesorFormDialogProps) {
  const isEditing = !!profesor
  const [form, setForm] = useState(emptyForm)
  const [activo, setActivo] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        titulo: profesor?.titulo ?? "",
        telefonoSecundario: profesor?.telefonoSecundario ?? "",
      })
      setActivo(profesor?.activo ?? true)
      setError(null)
    }
  }, [open, profesor])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validarCreacion = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!/^\d{7,8}$/.test(form.dni)) return "El DNI debe tener 7 u 8 dígitos"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "El email no es válido"
    if (!/^\d{6,15}$/.test(form.telefono)) return "El teléfono personal debe tener entre 6 y 15 dígitos"
    if (!form.titulo.trim()) return "El título es obligatorio"
    if (form.telefonoSecundario.trim() && !/^\d{6,15}$/.test(form.telefonoSecundario)) {
      return "El teléfono secundario debe tener entre 6 y 15 dígitos"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing) {
      if (!form.titulo.trim()) {
        setError("El título es obligatorio")
        return
      }
      if (form.telefonoSecundario.trim() && !/^\d{6,15}$/.test(form.telefonoSecundario)) {
        setError("El teléfono secundario debe tener entre 6 y 15 dígitos")
        return
      }
    } else {
      const validationError = validarCreacion()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setSubmitting(true)
    setError(null)
    try {
      if (isEditing) {
        const actualizado = await actualizarProfesor(profesor!.id, {
          titulo: form.titulo.trim(),
          telefonoSecundario: form.telefonoSecundario.trim(),
          activo,
        })
        toast.success("Profesor actualizado correctamente")
        onSuccess(actualizado)
      } else {
        const creado = await crearProfesor(form)
        toast.success("Profesor creado correctamente", {
          description: `Usuario autogenerado: ${form.dni} / Contraseña: ${form.dni}`,
        })
        onSuccess(creado)
      }
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el profesor"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isEditing ? undefined : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar profesor" : "Nuevo profesor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Título, teléfono secundario y estado son los únicos datos editables desde acá."
              : "El sistema crea automáticamente el usuario del profesor (username y contraseña = DNI)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {profesor!.nombre} {profesor!.apellido} · DNI {profesor!.dni}
            </div>
          )}

          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={form.nombre} onChange={setField("nombre")} disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={form.apellido} onChange={setField("apellido")} disabled={submitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={form.dni}
                    onChange={setField("dni")}
                    placeholder="Sin puntos, 7 u 8 dígitos"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono Personal</Label>
                  <Input id="telefono" value={form.telefono} onChange={setField("telefono")} disabled={submitting} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={setField("email")} disabled={submitting} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={setField("titulo")}
                placeholder="Ej. Ing. en Sistemas"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefonoSecundario">Teléfono Secundario (opcional)</Label>
              <Input
                id="telefonoSecundario"
                value={form.telefonoSecundario}
                onChange={setField("telefonoSecundario")}
                disabled={submitting}
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={activo ? "default" : "outline"}
                  onClick={() => setActivo(true)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Activo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!activo ? "secondary" : "outline"}
                  onClick={() => setActivo(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Inactivo
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear profesor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
