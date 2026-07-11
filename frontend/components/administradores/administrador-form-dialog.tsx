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
import { useAuth } from "@/hooks/use-auth"
import { createAdministrador, updateAdministrador } from "@/app/actions/administrador-actions"
import { buscarPersonaPorDniAction, type PersonaResumen } from "@/app/actions/persona-actions"
import type { Administrador, RolAdministrador } from "@/lib/services/administradores.service"

interface AdministradorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  administrador: Administrador | null
}

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  roles: ["ADMINISTRATIVO"] as RolAdministrador[],
}

export function AdministradorFormDialog({
  open,
  onOpenChange,
  administrador,
}: AdministradorFormDialogProps) {
  const { user } = useAuth()
  const isEditing = !!administrador
  const esUsuarioActual = isEditing && administrador!.username === user?.username

  const [form, setForm] = useState(emptyForm)
  const [enabled, setEnabled] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personaExistente, setPersonaExistente] = useState<PersonaResumen | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        nombre: administrador?.nombre ?? "",
        apellido: administrador?.apellido ?? "",
        dni: administrador?.dni ?? "",
        email: administrador?.email ?? "",
        telefono: administrador?.telefono ?? "",
        roles: administrador?.roles ?? ["ADMINISTRATIVO"],
      })
      setEnabled(administrador?.enabled ?? true)
      setError(null)
      setPersonaExistente(null)
    }
  }, [open, administrador])

  const setField = (field: keyof Omit<typeof form, "roles">) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const toggleRol = (rol: RolAdministrador) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(rol) ? prev.roles.filter((r) => r !== rol) : [...prev.roles, rol],
    }))
  }

  const handleDniBlur = async () => {
    if (isEditing || !/^\d{7,8}$/.test(form.dni)) {
      setPersonaExistente(null)
      return
    }
    const persona = await buscarPersonaPorDniAction(form.dni).catch(() => null)
    setPersonaExistente(persona)
    if (persona) {
      setForm((prev) => ({
        ...prev,
        nombre: persona.nombre,
        apellido: persona.apellido,
        email: persona.email,
        telefono: persona.telefono,
      }))
    }
  }

  const validar = (): string | null => {
    if (!/^\d{7,8}$/.test(form.dni)) return "El DNI debe tener 7 u 8 dígitos"
    if (form.roles.length === 0) return "Hay que seleccionar al menos un rol"
    if (!isEditing && personaExistente) return null
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "El email no es válido"
    if (!/^\d{6,15}$/.test(form.telefono)) return "El teléfono debe tener entre 6 y 15 dígitos"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("nombre", form.nombre.trim())
      formData.append("apellido", form.apellido.trim())
      formData.append("dni", form.dni.trim())
      formData.append("email", form.email.trim())
      formData.append("telefono", form.telefono.trim())
      form.roles.forEach((rol) => formData.append("roles", rol))

      if (isEditing) {
        await updateAdministrador(administrador!.id, formData, enabled)
        toast.success("Administrador actualizado correctamente")
      } else {
        await createAdministrador(formData)
        toast.success("Administrador creado correctamente", {
          description: `Usuario autogenerado: ${form.dni} / Contraseña: ${form.dni}`,
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el administrador"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar administrador" : "Nuevo administrador"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Legajo ${administrador?.legajo}. DNI, datos de contacto, roles y estado son editables desde acá. Se puede tener ADMIN y ADMINISTRATIVO a la vez. Si cambiás el DNI, el legajo se recalcula automáticamente.`
              : "El sistema crea automáticamente el usuario (username y contraseña = DNI). Se puede asignar más de un rol a la vez."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={form.dni}
              onChange={setField("dni")}
              onBlur={isEditing ? undefined : handleDniBlur}
              placeholder="Sin puntos, 7 u 8 dígitos"
              disabled={submitting}
            />
          </div>

          {personaExistente && (
            <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
              Persona existente: {personaExistente.nombre} {personaExistente.apellido} · Legajo{" "}
              {personaExistente.legajo}. Se le van a agregar los roles: {form.roles.join(", ")}.
            </div>
          )}

          {!personaExistente && (
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
          )}

          {!personaExistente && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={setField("email")} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={form.telefono} onChange={setField("telefono")} disabled={submitting} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Roles (se puede seleccionar más de uno)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={form.roles.includes("ADMIN") ? "default" : "outline"}
                onClick={() => toggleRol("ADMIN")}
                disabled={submitting || esUsuarioActual}
                className="flex-1"
              >
                Admin
              </Button>
              <Button
                type="button"
                size="sm"
                variant={form.roles.includes("ADMINISTRATIVO") ? "default" : "outline"}
                onClick={() => toggleRol("ADMINISTRATIVO")}
                disabled={submitting || esUsuarioActual}
                className="flex-1"
              >
                Administrativo
              </Button>
            </div>
            {esUsuarioActual && (
              <p className="text-xs text-muted-foreground">No podés cambiar tus propios roles.</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={enabled ? "default" : "outline"}
                  onClick={() => setEnabled(true)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Activo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!enabled ? "secondary" : "outline"}
                  onClick={() => setEnabled(false)}
                  disabled={submitting || esUsuarioActual}
                  className="flex-1"
                >
                  Inactivo
                </Button>
              </div>
              {esUsuarioActual && (
                <p className="text-xs text-muted-foreground">No podés deshabilitar tu propia cuenta.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
