# Catálogo Académico CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el CRUD frontend de Carrera, Plan de Estudio, Materia (con correlativas) y Cuatrimestre en `/dashboard/catalogo`, reemplazando el placeholder `CatalogoView`.

**Architecture:** 4 pares service+UI independientes (uno por entidad), montados como tabs dentro de `CatalogoView`. Cada UI replica el patrón ya probado de `frontend/components/comisiones/` (tabla + buscador + form dialog + dialog de baja). Sin cambios de backend — los 4 controllers ya existen y están completos.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript, shadcn/ui (Dialog, Table, Card, Badge, Skeleton, Checkbox), `sonner` para toasts, `apiClient` (`frontend/lib/api-client.ts`) como único wrapper HTTP.

## Global Constraints

- Gateway prefix: todo endpoint del Core se llama desde el frontend con prefijo `/api/core/...` aunque el `@RequestMapping` del controller sea `/api/...` (confirmado en `comisiones.service.ts` y `cuatrimestres.service.ts` existentes).
- `apiClient.post`/`.put` devuelven `ApiResponse<T[]>` — el elemento creado/actualizado es `response.data[0]`. `apiClient.get` para listados devuelve `response.data` (el array completo).
- Errores: `err.message` ya viene armado por `apiClient` (`extractErrorMessage`); patrón único: `toast.error(err?.message || "fallback")`.
- `components/ui/select.tsx` está roto en este proyecto (peer-dep). Usar `<select>` nativo con la clase `selectClassName` ya definida en `comision-form-dialog.tsx` — no usar el componente `Select` de shadcn.
- No hay framework de test unitario en frontend (sin jest/vitest). Verificación por tarea: `npx tsc --noEmit` sin errores. Pruebas de navegador las hace el usuario manualmente (Playwright desinstalado de este proyecto).
- Baja lógica vs física: Carrera/Plan de Estudio/Materia usan `DELETE` = baja lógica (`activa`/`activo` pasa a `false`), pero **ninguno de los 3 `Request` DTOs tiene ese campo** — no hay forma de reactivar desde el frontend una vez desactivado. Los dialogs de confirmación deben decir eso explícitamente, no prometer que se puede reactivar editando. Cuatrimestre es `DELETE` físico (no tiene campo `activa`).

---

### Task 1: Service de Carreras

**Files:**
- Create: `frontend/lib/services/carreras.service.ts`

**Interfaces:**
- Produces: `Carrera { id: number; nombre: string; descripcion: string; resolucion: string; activa: boolean }`, `CarreraInput { nombre: string; descripcion: string; resolucion: string }`, `listarCarreras(): Promise<Carrera[]>`, `crearCarrera(input: CarreraInput): Promise<Carrera>`, `actualizarCarrera(id: number, input: CarreraInput): Promise<Carrera>`, `desactivarCarrera(id: number): Promise<void>`.

- [ ] **Step 1: Crear el archivo del service**

```ts
import apiClient from "@/lib/api-client"

// Coincide con CarreraResponse del Core.
export interface Carrera {
  id: number
  nombre: string
  descripcion: string
  resolucion: string
  activa: boolean
}

export interface CarreraInput {
  nombre: string
  descripcion: string
  resolucion: string
}

const BASE_PATH = "/api/core/carreras"

export async function listarCarreras(): Promise<Carrera[]> {
  const response = await apiClient.get<Carrera[]>(BASE_PATH)
  return response.data
}

export async function crearCarrera(input: CarreraInput): Promise<Carrera> {
  const response = await apiClient.post<Carrera[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarCarrera(id: number, input: CarreraInput): Promise<Carrera> {
  const response = await apiClient.put<Carrera[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarCarrera(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos relacionados a `carreras.service.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/carreras.service.ts
git commit -m "feat(frontend): service de Carreras"
```

---

### Task 2: UI de Carreras

**Files:**
- Create: `frontend/components/catalogo/carrera-form-dialog.tsx`
- Create: `frontend/components/catalogo/eliminar-carrera-dialog.tsx`
- Create: `frontend/components/catalogo/carreras-view.tsx`

**Interfaces:**
- Consumes: `Carrera`, `CarreraInput`, `listarCarreras`, `crearCarrera`, `actualizarCarrera`, `desactivarCarrera` (Task 1).
- Produces: `CarreraFormDialog({ open, onOpenChange, carrera, onSuccess })`, `EliminarCarreraDialog({ open, onOpenChange, carrera, onSuccess })`, `CarrerasView()` — usados por `catalogo-view.tsx` en Task 9.

- [ ] **Step 1: Crear el form dialog**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { crearCarrera, actualizarCarrera, type Carrera } from "@/lib/services/carreras.service"

interface CarreraFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carrera: Carrera | null
  onSuccess: (carrera: Carrera) => void
}

const emptyForm = {
  nombre: "",
  descripcion: "",
  resolucion: "",
}

export function CarreraFormDialog({ open, onOpenChange, carrera, onSuccess }: CarreraFormDialogProps) {
  const isEditing = !!carrera
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      nombre: carrera?.nombre ?? "",
      descripcion: carrera?.descripcion ?? "",
      resolucion: carrera?.resolucion ?? "",
    })
    setError(null)
  }, [open, carrera])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    const input = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      resolucion: form.resolucion.trim(),
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarCarrera(carrera!.id, input)
        : await crearCarrera(input)

      toast.success(isEditing ? "Carrera actualizada correctamente" : "Carrera creada correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar la carrera"
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
          <DialogTitle>{isEditing ? "Editar carrera" : "Nueva carrera"}</DialogTitle>
          <DialogDescription>Nombre, descripción y resolución de aprobación de la carrera.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={setField("nombre")}
              placeholder="Ej. Tecnicatura en Programación"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={setField("descripcion")}
              placeholder="Descripción breve de la carrera"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolucion">Resolución</Label>
            <Input
              id="resolucion"
              value={form.resolucion}
              onChange={setField("resolucion")}
              placeholder="Ej. Res. 123/2024"
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear carrera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Crear el dialog de baja**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { desactivarCarrera, type Carrera } from "@/lib/services/carreras.service"

interface EliminarCarreraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carrera: Carrera | null
  onSuccess: (id: number) => void
}

export function EliminarCarreraDialog({ open, onOpenChange, carrera, onSuccess }: EliminarCarreraDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!carrera) return
    setSubmitting(true)
    try {
      await desactivarCarrera(carrera.id)
      toast.success("Carrera desactivada correctamente")
      onSuccess(carrera.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar la carrera")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar carrera</DialogTitle>
          <DialogDescription>
            {carrera && (
              <>
                ¿Seguro que querés desactivar <strong>{carrera.nombre}</strong>? No vas a poder reactivarla desde
                esta pantalla.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Crear la vista de listado**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CarreraFormDialog } from "./carrera-form-dialog"
import { EliminarCarreraDialog } from "./eliminar-carrera-dialog"
import { listarCarreras, type Carrera } from "@/lib/services/carreras.service"

export function CarrerasView() {
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCarrera, setDeletingCarrera] = useState<Carrera | null>(null)

  const cargarCarreras = async () => {
    setLoading(true)
    try {
      const data = await listarCarreras()
      setCarreras(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar las carreras")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCarreras()
  }, [])

  const carrerasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return carreras
    return carreras.filter((c) => c.nombre.toLowerCase().includes(term))
  }, [carreras, searchTerm])

  const abrirCrear = () => {
    setEditingCarrera(null)
    setFormOpen(true)
  }

  const abrirEditar = (carrera: Carrera) => {
    setEditingCarrera(carrera)
    setFormOpen(true)
  }

  const abrirEliminar = (carrera: Carrera) => {
    setDeletingCarrera(carrera)
    setDeleteOpen(true)
  }

  const handleGuardado = (carrera: Carrera) => {
    setCarreras((prev) => {
      const existe = prev.some((c) => c.id === carrera.id)
      return existe ? prev.map((c) => (c.id === carrera.id ? carrera : c)) : [...prev, carrera]
    })
  }

  const handleEliminado = (id: number) => {
    setCarreras((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Carreras</h2>
          <p className="text-sm text-muted-foreground">Carreras académicas ofrecidas por la institución</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nueva Carrera
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : carreras.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : carrerasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ninguna carrera coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Resolución</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carrerasFiltradas.map((carrera) => (
                <TableRow key={carrera.id}>
                  <TableCell className="font-medium">{carrera.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{carrera.resolucion || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={carrera.activa ? "default" : "secondary"}>
                      {carrera.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(carrera)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(carrera)} aria-label="Desactivar">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CarreraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        carrera={editingCarrera}
        onSuccess={handleGuardado}
      />
      <EliminarCarreraDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        carrera={deletingCarrera}
        onSuccess={handleEliminado}
      />
    </div>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <GraduationCap className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay carreras</p>
        <p className="text-sm text-muted-foreground">Creá la primera para empezar a estructurar el catálogo.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nueva Carrera
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/catalogo/carrera-form-dialog.tsx frontend/components/catalogo/eliminar-carrera-dialog.tsx frontend/components/catalogo/carreras-view.tsx
git commit -m "feat(frontend): UI CRUD de Carreras"
```

---

### Task 3: Service de Planes de Estudio

**Files:**
- Create: `frontend/lib/services/planes-estudio.service.ts`

**Interfaces:**
- Produces: `PlanEstudio { id: number; validez: string; resolucion: string; fechaInicio: string; fechaFin: string; activo: boolean; carreraId: number; carreraNombre: string }`, `PlanEstudioInput { validez: string; resolucion: string; fechaInicio: string; fechaFin: string; carreraId: number }`, `listarPlanesEstudio(): Promise<PlanEstudio[]>`, `crearPlanEstudio`, `actualizarPlanEstudio`, `desactivarPlanEstudio`.

- [ ] **Step 1: Crear el archivo del service**

```ts
import apiClient from "@/lib/api-client"

// Coincide con PlanEstudioResponse del Core.
export interface PlanEstudio {
  id: number
  validez: string
  resolucion: string
  fechaInicio: string
  fechaFin: string
  activo: boolean
  carreraId: number
  carreraNombre: string
}

export interface PlanEstudioInput {
  validez: string
  resolucion: string
  fechaInicio: string
  fechaFin: string
  carreraId: number
}

const BASE_PATH = "/api/core/planes-estudio"

export async function listarPlanesEstudio(): Promise<PlanEstudio[]> {
  const response = await apiClient.get<PlanEstudio[]>(BASE_PATH)
  return response.data
}

export async function crearPlanEstudio(input: PlanEstudioInput): Promise<PlanEstudio> {
  const response = await apiClient.post<PlanEstudio[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarPlanEstudio(id: number, input: PlanEstudioInput): Promise<PlanEstudio> {
  const response = await apiClient.put<PlanEstudio[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarPlanEstudio(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/planes-estudio.service.ts
git commit -m "feat(frontend): service de Planes de Estudio"
```

---

### Task 4: UI de Planes de Estudio

**Files:**
- Create: `frontend/components/catalogo/plan-estudio-form-dialog.tsx`
- Create: `frontend/components/catalogo/eliminar-plan-dialog.tsx`
- Create: `frontend/components/catalogo/planes-estudio-view.tsx`

**Interfaces:**
- Consumes: `PlanEstudio`, `PlanEstudioInput`, `listarPlanesEstudio`, `crearPlanEstudio`, `actualizarPlanEstudio`, `desactivarPlanEstudio` (Task 3); `Carrera`, `listarCarreras` (Task 1).
- Produces: `PlanEstudioFormDialog(...)`, `EliminarPlanDialog(...)`, `PlanesEstudioView()` — usados por `catalogo-view.tsx` en Task 9.

- [ ] **Step 1: Crear el form dialog**

```tsx
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
import { cn } from "@/lib/utils"
import { crearPlanEstudio, actualizarPlanEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import { listarCarreras, type Carrera } from "@/lib/services/carreras.service"

// @radix-ui/react-select no esta instalado en este proyecto (components/ui/select.tsx
// esta roto). Select nativo con la misma estetica que Input, en vez de una libreria rota.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface PlanEstudioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanEstudio | null
  onSuccess: (plan: PlanEstudio) => void
}

const emptyForm = {
  validez: "",
  resolucion: "",
  fechaInicio: "",
  fechaFin: "",
  carreraId: "",
}

export function PlanEstudioFormDialog({ open, onOpenChange, plan, onSuccess }: PlanEstudioFormDialogProps) {
  const isEditing = !!plan
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [opcionesLoading, setOpcionesLoading] = useState(true)
  const [carreras, setCarreras] = useState<Carrera[]>([])

  useEffect(() => {
    if (!open) return

    setForm({
      validez: plan?.validez ?? "",
      resolucion: plan?.resolucion ?? "",
      fechaInicio: plan?.fechaInicio ?? "",
      fechaFin: plan?.fechaFin ?? "",
      carreraId: plan ? String(plan.carreraId) : "",
    })
    setError(null)

    setOpcionesLoading(true)
    listarCarreras()
      .then(setCarreras)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las carreras")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, plan])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.validez.trim()) return "La validez es obligatoria"
    if (!form.fechaInicio) return "La fecha de inicio es obligatoria"
    if (!form.fechaFin) return "La fecha de fin es obligatoria"
    if (!form.carreraId) return "Seleccioná una carrera"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    const input = {
      validez: form.validez.trim(),
      resolucion: form.resolucion.trim(),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      carreraId: Number(form.carreraId),
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarPlanEstudio(plan!.id, input)
        : await crearPlanEstudio(input)

      toast.success(isEditing ? "Plan de estudio actualizado correctamente" : "Plan de estudio creado correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el plan de estudio"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = submitting || opcionesLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar plan de estudio" : "Nuevo plan de estudio"}</DialogTitle>
          <DialogDescription>Un plan de estudio pertenece a una Carrera y agrupa sus Materias.</DialogDescription>
        </DialogHeader>

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando carreras...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carreraId">Carrera</Label>
              <select
                id="carreraId"
                value={form.carreraId}
                onChange={setField("carreraId")}
                disabled={disabled}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná una carrera</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validez">Validez</Label>
                <Input
                  id="validez"
                  value={form.validez}
                  onChange={setField("validez")}
                  placeholder="Ej. Plan 2024"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolucion">Resolución</Label>
                <Input
                  id="resolucion"
                  value={form.resolucion}
                  onChange={setField("resolucion")}
                  placeholder="Ej. Res. 456/2024"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={setField("fechaInicio")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={form.fechaFin}
                  onChange={setField("fechaFin")}
                  disabled={disabled}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear plan de estudio"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Crear el dialog de baja**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { desactivarPlanEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

interface EliminarPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanEstudio | null
  onSuccess: (id: number) => void
}

export function EliminarPlanDialog({ open, onOpenChange, plan, onSuccess }: EliminarPlanDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!plan) return
    setSubmitting(true)
    try {
      await desactivarPlanEstudio(plan.id)
      toast.success("Plan de estudio desactivado correctamente")
      onSuccess(plan.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar el plan de estudio")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar plan de estudio</DialogTitle>
          <DialogDescription>
            {plan && (
              <>
                ¿Seguro que querés desactivar <strong>{plan.validez}</strong> ({plan.carreraNombre})? No vas a poder
                reactivarlo desde esta pantalla.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Crear la vista de listado**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlanEstudioFormDialog } from "./plan-estudio-form-dialog"
import { EliminarPlanDialog } from "./eliminar-plan-dialog"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

export function PlanesEstudioView() {
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanEstudio | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPlan, setDeletingPlan] = useState<PlanEstudio | null>(null)

  const cargarPlanes = async () => {
    setLoading(true)
    try {
      const data = await listarPlanesEstudio()
      setPlanes(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar los planes de estudio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPlanes()
  }, [])

  const planesFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return planes
    return planes.filter((p) => [p.validez, p.carreraNombre].some((campo) => campo?.toLowerCase().includes(term)))
  }, [planes, searchTerm])

  const abrirCrear = () => {
    setEditingPlan(null)
    setFormOpen(true)
  }

  const abrirEditar = (plan: PlanEstudio) => {
    setEditingPlan(plan)
    setFormOpen(true)
  }

  const abrirEliminar = (plan: PlanEstudio) => {
    setDeletingPlan(plan)
    setDeleteOpen(true)
  }

  const handleGuardado = (plan: PlanEstudio) => {
    setPlanes((prev) => {
      const existe = prev.some((p) => p.id === plan.id)
      return existe ? prev.map((p) => (p.id === plan.id ? plan : p)) : [...prev, plan]
    })
  }

  const handleEliminado = (id: number) => {
    setPlanes((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Planes de Estudio</h2>
          <p className="text-sm text-muted-foreground">Planes vigentes por carrera</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nuevo Plan
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por validez o carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : planes.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : planesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ningún plan coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Validez</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planesFiltrados.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.validez}</TableCell>
                  <TableCell>{plan.carreraNombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {plan.fechaInicio} — {plan.fechaFin}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.activo ? "default" : "secondary"}>
                      {plan.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(plan)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(plan)} aria-label="Desactivar">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <PlanEstudioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editingPlan}
        onSuccess={handleGuardado}
      />
      <EliminarPlanDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        plan={deletingPlan}
        onSuccess={handleEliminado}
      />
    </div>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay planes de estudio</p>
        <p className="text-sm text-muted-foreground">Creá el primero para poder cargar materias.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Plan
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/catalogo/plan-estudio-form-dialog.tsx frontend/components/catalogo/eliminar-plan-dialog.tsx frontend/components/catalogo/planes-estudio-view.tsx
git commit -m "feat(frontend): UI CRUD de Planes de Estudio"
```

---

### Task 5: Extender el service de Materias

**Files:**
- Modify: `frontend/lib/services/materias.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Produces (agrega a lo ya existente `Materia`, `listarMaterias`): `MateriaInput { nombre: string; cargaHoraria: number; anio: number; cuatrimestre: number; planEstudioId: number }`, `listarMateriasPorPlan(planId: number): Promise<Materia[]>`, `crearMateria(input: MateriaInput): Promise<Materia>`, `actualizarMateria(id: number, input: MateriaInput): Promise<Materia>`, `desactivarMateria(id: number): Promise<void>`, `asignarCorrelativas(id: number, correlativasIds: number[]): Promise<Materia>`.

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import apiClient from "@/lib/api-client"

// Coincide con MateriaResponse del Core.
export interface Materia {
  id: number
  nombre: string
  cargaHoraria: number
  anio: number
  cuatrimestre: number
  activa: boolean
  planEstudioId: number
  planEstudioValidez: string
  correlativasIds: number[]
}

export interface MateriaInput {
  nombre: string
  cargaHoraria: number
  anio: number
  cuatrimestre: number
  planEstudioId: number
}

const BASE_PATH = "/api/core/materias"

export async function listarMaterias(): Promise<Materia[]> {
  const response = await apiClient.get<Materia[]>(BASE_PATH)
  return response.data
}

export async function listarMateriasPorPlan(planId: number): Promise<Materia[]> {
  const response = await apiClient.get<Materia[]>(`${BASE_PATH}/plan/${planId}`)
  return response.data
}

export async function crearMateria(input: MateriaInput): Promise<Materia> {
  const response = await apiClient.post<Materia[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarMateria(id: number, input: MateriaInput): Promise<Materia> {
  const response = await apiClient.put<Materia[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function desactivarMateria(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}

export async function asignarCorrelativas(id: number, correlativasIds: number[]): Promise<Materia> {
  const response = await apiClient.post<Materia[]>(`${BASE_PATH}/${id}/correlativas`, correlativasIds)
  return response.data[0]
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos. `comision-form-dialog.tsx` (que ya importa `Materia`/`listarMaterias`) debe seguir compilando igual.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/materias.service.ts
git commit -m "feat(frontend): extender service de Materias (CRUD + correlativas)"
```

---

### Task 6: UI de Materias (con correlativas)

**Files:**
- Create: `frontend/components/catalogo/eliminar-materia-dialog.tsx`
- Create: `frontend/components/catalogo/materia-form-dialog.tsx`
- Create: `frontend/components/catalogo/materias-view.tsx`
- Modify: `frontend/package.json` (agregar `@radix-ui/react-checkbox`)

**Interfaces:**
- Consumes: `Materia`, `MateriaInput`, `listarMaterias`, `listarMateriasPorPlan`, `crearMateria`, `actualizarMateria`, `desactivarMateria`, `asignarCorrelativas` (Task 5); `PlanEstudio`, `listarPlanesEstudio` (Task 3).
- Produces: `MateriaFormDialog(...)`, `EliminarMateriaDialog(...)`, `MateriasView()` — usados por `catalogo-view.tsx` en Task 9.

- [ ] **Step 1: Instalar `@radix-ui/react-checkbox`**

`components/ui/checkbox.tsx` ya existe en el repo pero la dependencia nunca se instaló (mismo caso que `@radix-ui/react-tabs` en la feature anterior: conflicto de peer-deps preexistente con `react-use@13.14.3`, que pide React 16 contra el React 18.2.0 del proyecto).

Run: `cd frontend && npm install @radix-ui/react-checkbox --legacy-peer-deps`
Expected: instala sin error, `package.json` y `package-lock.json` quedan modificados.

- [ ] **Step 2: Crear el dialog de baja**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { desactivarMateria, type Materia } from "@/lib/services/materias.service"

interface EliminarMateriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materia: Materia | null
  onSuccess: (id: number) => void
}

export function EliminarMateriaDialog({ open, onOpenChange, materia, onSuccess }: EliminarMateriaDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!materia) return
    setSubmitting(true)
    try {
      await desactivarMateria(materia.id)
      toast.success("Materia desactivada correctamente")
      onSuccess(materia.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desactivar la materia")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar materia</DialogTitle>
          <DialogDescription>
            {materia && (
              <>
                ¿Seguro que querés desactivar <strong>{materia.nombre}</strong>? No vas a poder reactivarla desde
                esta pantalla.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Crear el form dialog con checklist de correlativas**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  crearMateria,
  actualizarMateria,
  listarMateriasPorPlan,
  asignarCorrelativas,
  type Materia,
} from "@/lib/services/materias.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface MateriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materia: Materia | null
  onSuccess: (materia: Materia) => void
}

const emptyForm = {
  nombre: "",
  cargaHoraria: "",
  anio: "",
  cuatrimestre: "",
  planEstudioId: "",
}

export function MateriaFormDialog({ open, onOpenChange, materia, onSuccess }: MateriaFormDialogProps) {
  const isEditing = !!materia
  const [form, setForm] = useState(emptyForm)
  const [correlativasIds, setCorrelativasIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [opcionesLoading, setOpcionesLoading] = useState(true)
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [materiasDelPlan, setMateriasDelPlan] = useState<Materia[]>([])
  const [correlativasLoading, setCorrelativasLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm({
      nombre: materia?.nombre ?? "",
      cargaHoraria: materia ? String(materia.cargaHoraria) : "",
      anio: materia ? String(materia.anio) : "",
      cuatrimestre: materia ? String(materia.cuatrimestre) : "",
      planEstudioId: materia ? String(materia.planEstudioId) : "",
    })
    setCorrelativasIds(materia?.correlativasIds ?? [])
    setError(null)

    setOpcionesLoading(true)
    listarPlanesEstudio()
      .then(setPlanes)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar los planes de estudio")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, materia])

  useEffect(() => {
    if (!open || !form.planEstudioId) {
      setMateriasDelPlan([])
      return
    }

    setCorrelativasLoading(true)
    listarMateriasPorPlan(Number(form.planEstudioId))
      .then((data) => {
        setMateriasDelPlan(data.filter((m) => m.id !== materia?.id))
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las materias del plan")
      })
      .finally(() => setCorrelativasLoading(false))
  }, [open, form.planEstudioId, materia?.id])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const toggleCorrelativa = (id: number) => {
    setCorrelativasIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.cargaHoraria || Number(form.cargaHoraria) <= 0) return "La carga horaria debe ser mayor a 0"
    if (!form.anio || Number(form.anio) <= 0) return "El año debe ser mayor a 0"
    if (!form.cuatrimestre) return "Seleccioná el cuatrimestre"
    if (!form.planEstudioId) return "Seleccioná un plan de estudio"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    const input = {
      nombre: form.nombre.trim(),
      cargaHoraria: Number(form.cargaHoraria),
      anio: Number(form.anio),
      cuatrimestre: Number(form.cuatrimestre),
      planEstudioId: Number(form.planEstudioId),
    }

    setSubmitting(true)
    setError(null)
    try {
      const guardada = isEditing
        ? await actualizarMateria(materia!.id, input)
        : await crearMateria(input)

      const resultado = await asignarCorrelativas(guardada.id, correlativasIds)

      toast.success(isEditing ? "Materia actualizada correctamente" : "Materia creada correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar la materia"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = submitting || opcionesLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar materia" : "Nueva materia"}</DialogTitle>
          <DialogDescription>Una materia pertenece a un Plan de Estudio y puede tener correlativas.</DialogDescription>
        </DialogHeader>

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando planes de estudio...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={setField("nombre")}
                placeholder="Ej. Matemática 1"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planEstudioId">Plan de estudio</Label>
              <select
                id="planEstudioId"
                value={form.planEstudioId}
                onChange={setField("planEstudioId")}
                disabled={disabled}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná un plan</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.carreraNombre} — {p.validez}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga horaria</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  min={1}
                  value={form.cargaHoraria}
                  onChange={setField("cargaHoraria")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  min={1}
                  value={form.anio}
                  onChange={setField("anio")}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuatrimestre">Cuatrimestre</Label>
                <select
                  id="cuatrimestre"
                  value={form.cuatrimestre}
                  onChange={setField("cuatrimestre")}
                  disabled={disabled}
                  className={cn(selectClassName)}
                >
                  <option value="">—</option>
                  <option value="1">1°</option>
                  <option value="2">2°</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correlativas</Label>
              {!form.planEstudioId ? (
                <p className="text-sm text-muted-foreground">Elegí un plan de estudio para ver sus materias.</p>
              ) : correlativasLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando materias del plan...
                </div>
              ) : materiasDelPlan.length === 0 ? (
                <p className="text-sm text-muted-foreground">Este plan todavía no tiene otras materias.</p>
              ) : (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                  {materiasDelPlan.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={correlativasIds.includes(m.id)}
                        onCheckedChange={() => toggleCorrelativa(m.id)}
                        disabled={disabled}
                      />
                      {m.nombre} (Año {m.anio})
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={disabled} className="w-full sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear materia"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Crear la vista de listado**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MateriaFormDialog } from "./materia-form-dialog"
import { EliminarMateriaDialog } from "./eliminar-materia-dialog"
import { listarMaterias, type Materia } from "@/lib/services/materias.service"

export function MateriasView() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingMateria, setDeletingMateria] = useState<Materia | null>(null)

  const cargarMaterias = async () => {
    setLoading(true)
    try {
      const data = await listarMaterias()
      setMaterias(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar las materias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarMaterias()
  }, [])

  const materiasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return materias
    return materias.filter((m) =>
      [m.nombre, m.planEstudioValidez].some((campo) => campo?.toLowerCase().includes(term))
    )
  }, [materias, searchTerm])

  const abrirCrear = () => {
    setEditingMateria(null)
    setFormOpen(true)
  }

  const abrirEditar = (materia: Materia) => {
    setEditingMateria(materia)
    setFormOpen(true)
  }

  const abrirEliminar = (materia: Materia) => {
    setDeletingMateria(materia)
    setDeleteOpen(true)
  }

  const handleGuardado = (materia: Materia) => {
    setMaterias((prev) => {
      const existe = prev.some((m) => m.id === materia.id)
      return existe ? prev.map((m) => (m.id === materia.id ? materia : m)) : [...prev, materia]
    })
  }

  const handleEliminado = (id: number) => {
    setMaterias((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Materias</h2>
          <p className="text-sm text-muted-foreground">Materias por plan de estudio, con sus correlativas</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nueva Materia
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : materias.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : materiasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ninguna materia coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Año / Cuatrimestre</TableHead>
                <TableHead>Correlativas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiasFiltradas.map((materia) => (
                <TableRow key={materia.id}>
                  <TableCell className="font-medium">{materia.nombre}</TableCell>
                  <TableCell>{materia.planEstudioValidez}</TableCell>
                  <TableCell className="text-muted-foreground">
                    Año {materia.anio} - {materia.cuatrimestre}°
                  </TableCell>
                  <TableCell className="text-muted-foreground">{materia.correlativasIds.length}</TableCell>
                  <TableCell>
                    <Badge variant={materia.activa ? "default" : "secondary"}>
                      {materia.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(materia)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(materia)} aria-label="Desactivar">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <MateriaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        materia={editingMateria}
        onSuccess={handleGuardado}
      />
      <EliminarMateriaDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        materia={deletingMateria}
        onSuccess={handleEliminado}
      />
    </div>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay materias</p>
        <p className="text-sm text-muted-foreground">Creá la primera dentro de un plan de estudio.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nueva Materia
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/components/catalogo/eliminar-materia-dialog.tsx frontend/components/catalogo/materia-form-dialog.tsx frontend/components/catalogo/materias-view.tsx
git commit -m "feat(frontend): UI CRUD de Materias con checklist de correlativas"
```

---

### Task 7: Extender el service de Cuatrimestres

**Files:**
- Modify: `frontend/lib/services/cuatrimestres.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Produces (agrega a lo ya existente `Cuatrimestre`, `listarCuatrimestres`): `CuatrimestreInput { anio: number; numero: number; fechaInicio: string; fechaFin: string; actual: boolean }`, `crearCuatrimestre`, `actualizarCuatrimestre`, `eliminarCuatrimestre`.

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import apiClient from "@/lib/api-client"

// Coincide con CuatrimestreResponse del Core.
export interface Cuatrimestre {
  id: number
  anio: number
  numero: number
  fechaInicio: string
  fechaFin: string
  actual: boolean
}

export interface CuatrimestreInput {
  anio: number
  numero: number
  fechaInicio: string
  fechaFin: string
  actual: boolean
}

const BASE_PATH = "/api/core/cuatrimestres"

export async function listarCuatrimestres(): Promise<Cuatrimestre[]> {
  const response = await apiClient.get<Cuatrimestre[]>(BASE_PATH)
  return response.data
}

export async function crearCuatrimestre(input: CuatrimestreInput): Promise<Cuatrimestre> {
  const response = await apiClient.post<Cuatrimestre[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarCuatrimestre(id: number, input: CuatrimestreInput): Promise<Cuatrimestre> {
  const response = await apiClient.put<Cuatrimestre[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarCuatrimestre(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos. `comision-form-dialog.tsx` (ya importa `Cuatrimestre`/`listarCuatrimestres`) debe seguir compilando igual.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/cuatrimestres.service.ts
git commit -m "feat(frontend): extender service de Cuatrimestres (CRUD)"
```

---

### Task 8: UI de Cuatrimestres

**Files:**
- Create: `frontend/components/catalogo/cuatrimestre-form-dialog.tsx`
- Create: `frontend/components/catalogo/eliminar-cuatrimestre-dialog.tsx`
- Create: `frontend/components/catalogo/cuatrimestres-view.tsx`

**Interfaces:**
- Consumes: `Cuatrimestre`, `CuatrimestreInput`, `listarCuatrimestres`, `crearCuatrimestre`, `actualizarCuatrimestre`, `eliminarCuatrimestre` (Task 7).
- Produces: `CuatrimestreFormDialog(...)`, `EliminarCuatrimestreDialog(...)`, `CuatrimestresView()` — usados por `catalogo-view.tsx` en Task 9.

- [ ] **Step 1: Crear el form dialog**

```tsx
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
import { cn } from "@/lib/utils"
import {
  crearCuatrimestre,
  actualizarCuatrimestre,
  type Cuatrimestre,
} from "@/lib/services/cuatrimestres.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface CuatrimestreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuatrimestre: Cuatrimestre | null
  onSuccess: (cuatrimestre: Cuatrimestre) => void
}

const emptyForm = {
  anio: "",
  numero: "",
  fechaInicio: "",
  fechaFin: "",
}

export function CuatrimestreFormDialog({
  open,
  onOpenChange,
  cuatrimestre,
  onSuccess,
}: CuatrimestreFormDialogProps) {
  const isEditing = !!cuatrimestre
  const [form, setForm] = useState(emptyForm)
  const [actual, setActual] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      anio: cuatrimestre ? String(cuatrimestre.anio) : "",
      numero: cuatrimestre ? String(cuatrimestre.numero) : "",
      fechaInicio: cuatrimestre?.fechaInicio ?? "",
      fechaFin: cuatrimestre?.fechaFin ?? "",
    })
    setActual(cuatrimestre?.actual ?? false)
    setError(null)
  }, [open, cuatrimestre])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.anio || Number(form.anio) < 2000) return "El año debe ser 2000 o posterior"
    if (!form.numero) return "Seleccioná el número de cuatrimestre"
    if (!form.fechaInicio) return "La fecha de inicio es obligatoria"
    if (!form.fechaFin) return "La fecha de fin es obligatoria"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    const input = {
      anio: Number(form.anio),
      numero: Number(form.numero),
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      actual,
    }

    setSubmitting(true)
    setError(null)
    try {
      const resultado = isEditing
        ? await actualizarCuatrimestre(cuatrimestre!.id, input)
        : await crearCuatrimestre(input)

      toast.success(isEditing ? "Cuatrimestre actualizado correctamente" : "Cuatrimestre creado correctamente")
      onSuccess(resultado)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el cuatrimestre"
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
          <DialogTitle>{isEditing ? "Editar cuatrimestre" : "Nuevo cuatrimestre"}</DialogTitle>
          <DialogDescription>Período lectivo que agrupa las comisiones dictadas en esas fechas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                min={2000}
                value={form.anio}
                onChange={setField("anio")}
                placeholder="2026"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <select
                id="numero"
                value={form.numero}
                onChange={setField("numero")}
                disabled={submitting}
                className={cn(selectClassName)}
              >
                <option value="">—</option>
                <option value="1">1° cuatrimestre</option>
                <option value="2">2° cuatrimestre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={form.fechaInicio}
                onChange={setField("fechaInicio")}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={form.fechaFin}
                onChange={setField("fechaFin")}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>¿Es el cuatrimestre actual?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={actual ? "default" : "outline"}
                onClick={() => setActual(true)}
                disabled={submitting}
                className="flex-1"
              >
                Actual
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!actual ? "secondary" : "outline"}
                onClick={() => setActual(false)}
                disabled={submitting}
                className="flex-1"
              >
                No actual
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear cuatrimestre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Crear el dialog de eliminación (física)**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { eliminarCuatrimestre, type Cuatrimestre } from "@/lib/services/cuatrimestres.service"

interface EliminarCuatrimestreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuatrimestre: Cuatrimestre | null
  onSuccess: (id: number) => void
}

export function EliminarCuatrimestreDialog({
  open,
  onOpenChange,
  cuatrimestre,
  onSuccess,
}: EliminarCuatrimestreDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!cuatrimestre) return
    setSubmitting(true)
    try {
      await eliminarCuatrimestre(cuatrimestre.id)
      toast.success("Cuatrimestre eliminado correctamente")
      onSuccess(cuatrimestre.id)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el cuatrimestre")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar cuatrimestre</DialogTitle>
          <DialogDescription>
            {cuatrimestre && (
              <>
                ¿Seguro que querés eliminar <strong>{cuatrimestre.anio} - {cuatrimestre.numero}°</strong>? A
                diferencia de Carrera/Plan/Materia, esta es una eliminación física y no se puede deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Crear la vista de listado**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CuatrimestreFormDialog } from "./cuatrimestre-form-dialog"
import { EliminarCuatrimestreDialog } from "./eliminar-cuatrimestre-dialog"
import { listarCuatrimestres, type Cuatrimestre } from "@/lib/services/cuatrimestres.service"

export function CuatrimestresView() {
  const [cuatrimestres, setCuatrimestres] = useState<Cuatrimestre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingCuatrimestre, setEditingCuatrimestre] = useState<Cuatrimestre | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCuatrimestre, setDeletingCuatrimestre] = useState<Cuatrimestre | null>(null)

  const cargarCuatrimestres = async () => {
    setLoading(true)
    try {
      const data = await listarCuatrimestres()
      setCuatrimestres(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar los cuatrimestres")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCuatrimestres()
  }, [])

  const cuatrimestresFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return cuatrimestres
    return cuatrimestres.filter((c) => `${c.anio} ${c.numero}`.includes(term))
  }, [cuatrimestres, searchTerm])

  const abrirCrear = () => {
    setEditingCuatrimestre(null)
    setFormOpen(true)
  }

  const abrirEditar = (cuatrimestre: Cuatrimestre) => {
    setEditingCuatrimestre(cuatrimestre)
    setFormOpen(true)
  }

  const abrirEliminar = (cuatrimestre: Cuatrimestre) => {
    setDeletingCuatrimestre(cuatrimestre)
    setDeleteOpen(true)
  }

  const handleGuardado = (cuatrimestre: Cuatrimestre) => {
    setCuatrimestres((prev) => {
      const existe = prev.some((c) => c.id === cuatrimestre.id)
      return existe ? prev.map((c) => (c.id === cuatrimestre.id ? cuatrimestre : c)) : [...prev, cuatrimestre]
    })
  }

  const handleEliminado = (id: number) => {
    setCuatrimestres((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Cuatrimestres</h2>
          <p className="text-sm text-muted-foreground">Períodos lectivos disponibles para crear comisiones</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nuevo Cuatrimestre
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por año o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : cuatrimestres.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : cuatrimestresFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ningún cuatrimestre coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Año</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuatrimestresFiltrados.map((cuatrimestre) => (
                <TableRow key={cuatrimestre.id}>
                  <TableCell className="font-medium">{cuatrimestre.anio}</TableCell>
                  <TableCell>{cuatrimestre.numero}°</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cuatrimestre.fechaInicio} — {cuatrimestre.fechaFin}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cuatrimestre.actual ? "default" : "secondary"}>
                      {cuatrimestre.actual ? "Actual" : "No actual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(cuatrimestre)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(cuatrimestre)} aria-label="Eliminar">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CuatrimestreFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cuatrimestre={editingCuatrimestre}
        onSuccess={handleGuardado}
      />
      <EliminarCuatrimestreDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        cuatrimestre={deletingCuatrimestre}
        onSuccess={handleEliminado}
      />
    </div>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay cuatrimestres</p>
        <p className="text-sm text-muted-foreground">Creá el primero para poder abrir comisiones.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Cuatrimestre
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/catalogo/cuatrimestre-form-dialog.tsx frontend/components/catalogo/eliminar-cuatrimestre-dialog.tsx frontend/components/catalogo/cuatrimestres-view.tsx
git commit -m "feat(frontend): UI CRUD de Cuatrimestres"
```

---

### Task 9: Wiring final — reescribir CatalogoView con tabs

**Files:**
- Modify: `frontend/components/academico/catalogo-view.tsx` (reemplazo completo del placeholder)

**Interfaces:**
- Consumes: `CarrerasView` (Task 2), `PlanesEstudioView` (Task 4), `MateriasView` (Task 6), `CuatrimestresView` (Task 8).
- Produces: `CatalogoView()` — ya consumido por `frontend/app/dashboard/catalogo/page.tsx` (sin cambios, ya hace `<RequireRole roles={["ADMIN","ADMINISTRATIVO"]}><CatalogoView /></RequireRole>`).

- [ ] **Step 1: Reemplazar el placeholder**

```tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarrerasView } from "@/components/catalogo/carreras-view"
import { PlanesEstudioView } from "@/components/catalogo/planes-estudio-view"
import { MateriasView } from "@/components/catalogo/materias-view"
import { CuatrimestresView } from "@/components/catalogo/cuatrimestres-view"

export function CatalogoView() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">Catálogo Académico</h1>
        <p className="text-muted-foreground">Carreras, planes de estudio, materias y cuatrimestres</p>
      </div>

      <Tabs defaultValue="carreras" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="carreras">Carreras</TabsTrigger>
          <TabsTrigger value="planes">Planes de Estudio</TabsTrigger>
          <TabsTrigger value="materias">Materias</TabsTrigger>
          <TabsTrigger value="cuatrimestres">Cuatrimestres</TabsTrigger>
        </TabsList>
        <TabsContent value="carreras" className="mt-4">
          <CarrerasView />
        </TabsContent>
        <TabsContent value="planes" className="mt-4">
          <PlanesEstudioView />
        </TabsContent>
        <TabsContent value="materias" className="mt-4">
          <MateriasView />
        </TabsContent>
        <TabsContent value="cuatrimestres" className="mt-4">
          <CuatrimestresView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos de todo el proyecto**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errores en todo el proyecto.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/academico/catalogo-view.tsx
git commit -m "feat(frontend): wiring de CatalogoView con tabs Carreras/Planes/Materias/Cuatrimestres"
```

---

## Después de completar todos los Tasks

Con los 9 tasks mergeados en `feature/catalogo-academico-crud`:
1. Levantar el stack (`docker compose up` o `npm run dev` + backend) y probar manualmente en el navegador: crear Carrera → Plan de Estudio → Materia → Cuatrimestre → verificar que aparecen en los dropdowns de `/dashboard/comisiones`.
2. Seguir `superpowers:finishing-a-development-branch` para el merge fast-forward a `develop`.
