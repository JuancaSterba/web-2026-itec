# Inscripción de Alumnos (Carrera → Comisión) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar el flujo completo de inscripción de alumnos: inscribir a un alumno en una Carrera (pantalla propia), filtrar Comisiones por Carrera, y dentro del dashboard real de una Comisión, ver la nómina e inscribir alumnos buscándolos por DNI.

**Architecture:** 100% frontend — el backend ya expone todo lo necesario (`AlumnoController`, `AlumnoCarreraController`, `AlumnoInscriptoController`). Se conectan 3 piezas: (1) dialog de inscripción a Carrera desde `/dashboard/alumnos`, (2) filtro por Carrera en `/dashboard/comisiones` (resuelto en cliente cruzando Materia→Plan→Carrera), (3) `comision-dashboard.tsx` pasa de placeholder a datos reales, con nómina real y alta por DNI.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript, shadcn/ui (Dialog, Table, Card, Badge), `sonner`, `apiClient`.

## Global Constraints

- Gateway prefix: `/api/core/...` para todo endpoint del Core (igual que el resto del proyecto).
- `apiClient.post`/`.put` → `response.data[0]` es el elemento creado/actualizado; `apiClient.get` de listados → `response.data` es el array completo.
- `err.message` ya viene armado por `apiClient`; patrón: `toast.error(err?.message || "fallback")`.
- `components/ui/select.tsx` roto (peer-dep) — usar `<select>` nativo con `selectClassName` (igual que en `comision-form-dialog.tsx` y `frontend/components/catalogo/*`).
- Confirmado por exploración previa: `comisionMateriaId` del request de `AlumnoInscriptoRequest` **es el mismo id** que `Comision.id` en todo el resto del frontend (la entidad backend se llama `ComisionMateria` pero no hay dos ids distintos para "comisión").
- No hay framework de test unitario en frontend. Verificación por tarea: `npx tsc --noEmit` sin errores nuevos. Pruebas de navegador las hace el usuario manualmente (Playwright desinstalado del proyecto).
- `roster.service.ts` es compartido con Asistencias y Calificaciones (comentario en el archivo) — cualquier cambio a `AlumnoRoster` debe ser **aditivo** (agregar campos), nunca remover/renombrar los existentes (`alumnoId`, `nombreCompleto`), para no romper esos consumidores.
- Ningún cambio de backend en este plan.

---

### Task 1: Service de Inscripciones a Carrera

**Files:**
- Create: `frontend/lib/services/inscripciones-carreras.service.ts`

**Interfaces:**
- Produces: `InscripcionCarrera { id: number; alumnoId: number; alumnoNombreCompleto: string; carreraId: number; carreraNombre: string; planEstudioId: number; planEstudioResolucion: string; anioIngreso: number }`, `InscripcionCarreraInput { alumnoId: number; carreraId: number; planEstudioId: number; anioIngreso: number }`, `listarInscripcionesCarreraPorAlumno(alumnoId: number): Promise<InscripcionCarrera[]>`, `crearInscripcionCarrera(input: InscripcionCarreraInput): Promise<InscripcionCarrera>`, `eliminarInscripcionCarrera(id: number): Promise<void>`.

- [ ] **Step 1: Crear el archivo del service**

```ts
import apiClient from "@/lib/api-client"

// Coincide con AlumnoCarreraResponse del Core.
export interface InscripcionCarrera {
  id: number
  alumnoId: number
  alumnoNombreCompleto: string
  carreraId: number
  carreraNombre: string
  planEstudioId: number
  planEstudioResolucion: string
  anioIngreso: number
}

export interface InscripcionCarreraInput {
  alumnoId: number
  carreraId: number
  planEstudioId: number
  anioIngreso: number
}

const BASE_PATH = "/api/core/inscripciones-carreras"

export async function listarInscripcionesCarreraPorAlumno(alumnoId: number): Promise<InscripcionCarrera[]> {
  const response = await apiClient.get<InscripcionCarrera[]>(`${BASE_PATH}/alumno/${alumnoId}`)
  return response.data
}

export async function crearInscripcionCarrera(input: InscripcionCarreraInput): Promise<InscripcionCarrera> {
  const response = await apiClient.post<InscripcionCarrera[]>(BASE_PATH, input)
  return response.data[0]
}

export async function eliminarInscripcionCarrera(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/inscripciones-carreras.service.ts
git commit -m "feat(frontend): service de Inscripciones a Carrera"
```

---

### Task 2: Dialog "Inscribir en Carrera"

**Files:**
- Create: `frontend/components/alumnos/inscribir-carrera-dialog.tsx`

**Interfaces:**
- Consumes: `InscripcionCarrera`, `listarInscripcionesCarreraPorAlumno`, `crearInscripcionCarrera`, `eliminarInscripcionCarrera` (Task 1); `Carrera`, `listarCarreras` (ya existe, feature Catálogo); `PlanEstudio`, `listarPlanesEstudio` (ya existe, feature Catálogo); `Alumno` (ya existe en `alumnos.service.ts`).
- Produces: `InscribirCarreraDialog({ open, onOpenChange, alumno })` — usado por `/dashboard/alumnos/page.tsx` en Task 3.

- [ ] **Step 1: Crear el dialog**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
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
  listarInscripcionesCarreraPorAlumno,
  crearInscripcionCarrera,
  eliminarInscripcionCarrera,
  type InscripcionCarrera,
} from "@/lib/services/inscripciones-carreras.service"
import { listarCarreras, type Carrera } from "@/lib/services/carreras.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import type { Alumno } from "@/lib/services/alumnos.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface InscribirCarreraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alumno: Alumno | null
}

export function InscribirCarreraDialog({ open, onOpenChange, alumno }: InscribirCarreraDialogProps) {
  const [inscripciones, setInscripciones] = useState<InscripcionCarrera[]>([])
  const [loading, setLoading] = useState(true)

  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [opcionesLoading, setOpcionesLoading] = useState(true)

  const [carreraId, setCarreraId] = useState("")
  const [planEstudioId, setPlanEstudioId] = useState("")
  const [anioIngreso, setAnioIngreso] = useState(String(new Date().getFullYear()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !alumno) return

    setLoading(true)
    listarInscripcionesCarreraPorAlumno(alumno.id)
      .then(setInscripciones)
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar las inscripciones del alumno")
      })
      .finally(() => setLoading(false))

    setCarreraId("")
    setPlanEstudioId("")
    setAnioIngreso(String(new Date().getFullYear()))
    setError(null)

    setOpcionesLoading(true)
    Promise.all([listarCarreras(), listarPlanesEstudio()])
      .then(([carrerasData, planesData]) => {
        setCarreras(carrerasData)
        setPlanes(planesData)
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudieron cargar carreras y planes de estudio")
      })
      .finally(() => setOpcionesLoading(false))
  }, [open, alumno])

  const planesDeCarrera = planes.filter((p) => String(p.carreraId) === carreraId)

  const handleQuitar = async (inscripcion: InscripcionCarrera) => {
    try {
      await eliminarInscripcionCarrera(inscripcion.id)
      setInscripciones((prev) => prev.filter((i) => i.id !== inscripcion.id))
      toast.success("Inscripción a carrera eliminada correctamente")
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar la inscripción")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alumno) return

    if (!carreraId) {
      setError("Seleccioná una carrera")
      return
    }
    if (!planEstudioId) {
      setError("Seleccioná un plan de estudio")
      return
    }
    if (!anioIngreso || Number(anioIngreso) < 2000) {
      setError("El año de ingreso debe ser 2000 o posterior")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const nueva = await crearInscripcionCarrera({
        alumnoId: alumno.id,
        carreraId: Number(carreraId),
        planEstudioId: Number(planEstudioId),
        anioIngreso: Number(anioIngreso),
      })
      setInscripciones((prev) => [...prev, nueva])
      setCarreraId("")
      setPlanEstudioId("")
      toast.success("Alumno inscripto en la carrera correctamente")
    } catch (err: any) {
      const message = err?.message || "No se pudo inscribir al alumno en la carrera"
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
          <DialogTitle>Inscripción a Carrera</DialogTitle>
          <DialogDescription>
            {alumno && (
              <>
                Carreras en las que <strong>{alumno.nombre} {alumno.apellido}</strong> está inscripto, y alta de una
                nueva.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando inscripciones...
          </div>
        ) : inscripciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no está inscripto en ninguna carrera.</p>
        ) : (
          <ul className="space-y-2">
            {inscripciones.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{i.carreraNombre}</p>
                  <p className="text-muted-foreground">
                    {i.planEstudioResolucion} — Ingreso {i.anioIngreso}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleQuitar(i)} aria-label="Quitar">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {opcionesLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando carreras y planes...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="carreraId">Carrera</Label>
              <select
                id="carreraId"
                value={carreraId}
                onChange={(e) => {
                  setCarreraId(e.target.value)
                  setPlanEstudioId("")
                }}
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

            <div className="space-y-2">
              <Label htmlFor="planEstudioId">Plan de estudio</Label>
              <select
                id="planEstudioId"
                value={planEstudioId}
                onChange={(e) => setPlanEstudioId(e.target.value)}
                disabled={disabled || !carreraId}
                className={cn(selectClassName)}
              >
                <option value="">Seleccioná un plan</option>
                {planesDeCarrera.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.validez}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anioIngreso">Año de ingreso</Label>
              <Input
                id="anioIngreso"
                type="number"
                min={2000}
                value={anioIngreso}
                onChange={(e) => setAnioIngreso(e.target.value)}
                disabled={disabled}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={disabled} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Inscribir en Carrera
            </Button>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/alumnos/inscribir-carrera-dialog.tsx
git commit -m "feat(frontend): dialog Inscribir en Carrera"
```

---

### Task 3: Wiring en /dashboard/alumnos

**Files:**
- Modify: `frontend/app/dashboard/alumnos/page.tsx` (reemplazo completo del archivo)

**Interfaces:**
- Consumes: `InscribirCarreraDialog` (Task 2).

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, GraduationCap, BookOpen } from "lucide-react"
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
import { AlumnoFormDialog } from "@/components/alumnos/alumno-form-dialog"
import { EliminarAlumnoDialog } from "@/components/alumnos/eliminar-alumno-dialog"
import { InscribirCarreraDialog } from "@/components/alumnos/inscribir-carrera-dialog"
import { RequireRole } from "@/components/auth/require-role"
import { listarAlumnos, type Alumno } from "@/lib/services/alumnos.service"

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingAlumno, setDeletingAlumno] = useState<Alumno | null>(null)

  const [inscribirCarreraOpen, setInscribirCarreraOpen] = useState(false)
  const [alumnoParaInscribir, setAlumnoParaInscribir] = useState<Alumno | null>(null)

  const cargarAlumnos = async () => {
    setLoading(true)
    try {
      const data = await listarAlumnos()
      setAlumnos(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar los alumnos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarAlumnos()
  }, [])

  const alumnosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return alumnos
    return alumnos.filter((a) =>
      [a.nombre, a.apellido, a.dni, a.email, a.legajo].some((campo) =>
        campo?.toLowerCase().includes(term)
      )
    )
  }, [alumnos, searchTerm])

  const abrirCrear = () => {
    setEditingAlumno(null)
    setFormOpen(true)
  }

  const abrirEditar = (alumno: Alumno) => {
    setEditingAlumno(alumno)
    setFormOpen(true)
  }

  const abrirEliminar = (alumno: Alumno) => {
    setDeletingAlumno(alumno)
    setDeleteOpen(true)
  }

  const abrirInscribirCarrera = (alumno: Alumno) => {
    setAlumnoParaInscribir(alumno)
    setInscribirCarreraOpen(true)
  }

  const handleGuardado = (alumno: Alumno) => {
    setAlumnos((prev) => {
      const existe = prev.some((a) => a.id === alumno.id)
      return existe ? prev.map((a) => (a.id === alumno.id ? alumno : a)) : [...prev, alumno]
    })
  }

  const handleEliminado = (id: number) => {
    setAlumnos((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <RequireRole roles={["ADMIN", "ADMINISTRATIVO"]}>
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Gestión de Alumnos</h1>
          <p className="text-sm text-muted-foreground">Administra los alumnos del instituto</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nuevo Alumno
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, email o legajo..."
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
        ) : alumnos.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : alumnosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ningún alumno coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Legajo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumnosFiltrados.map((alumno) => (
                <TableRow key={alumno.id}>
                  <TableCell className="font-medium">{alumno.nombre}</TableCell>
                  <TableCell>{alumno.apellido}</TableCell>
                  <TableCell>{alumno.dni}</TableCell>
                  <TableCell className="text-muted-foreground">{alumno.email}</TableCell>
                  <TableCell>{alumno.legajo || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={alumno.activo ? "default" : "secondary"}>
                      {alumno.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirInscribirCarrera(alumno)}
                        aria-label="Inscribir en Carrera"
                      >
                        <BookOpen className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(alumno)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(alumno)} aria-label="Eliminar">
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

      <AlumnoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        alumno={editingAlumno}
        onSuccess={handleGuardado}
      />
      <EliminarAlumnoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        alumno={deletingAlumno}
        onSuccess={handleEliminado}
      />
      <InscribirCarreraDialog
        open={inscribirCarreraOpen}
        onOpenChange={setInscribirCarreraOpen}
        alumno={alumnoParaInscribir}
      />
    </div>
    </RequireRole>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <GraduationCap className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay alumnos</p>
        <p className="text-sm text-muted-foreground">Creá el primero para empezar a gestionar la institución.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Alumno
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/alumnos/page.tsx
git commit -m "feat(frontend): wiring de Inscribir en Carrera en gestión de Alumnos"
```

---

### Task 4: Filtro y columna de Carrera en Comisiones

**Files:**
- Modify: `frontend/app/dashboard/comisiones/page.tsx` (reemplazo completo del archivo)

**Interfaces:**
- Consumes: `Materia`, `listarMaterias` (ya existe, feature Catálogo); `PlanEstudio`, `listarPlanesEstudio` (ya existe, feature Catálogo).

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, Calendar, LayoutDashboard } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { ComisionFormDialog } from "@/components/comisiones/comision-form-dialog"
import { EliminarComisionDialog } from "@/components/comisiones/eliminar-comision-dialog"
import { listarComisiones, type Comision } from "@/lib/services/comisiones.service"
import { listarMaterias, type Materia } from "@/lib/services/materias.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

export default function ComisionesPage() {
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [planes, setPlanes] = useState<PlanEstudio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [carreraFiltro, setCarreraFiltro] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingComision, setEditingComision] = useState<Comision | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingComision, setDeletingComision] = useState<Comision | null>(null)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [comisionesData, materiasData, planesData] = await Promise.all([
        listarComisiones(),
        listarMaterias(),
        listarPlanesEstudio(),
      ])
      setComisiones(comisionesData)
      setMaterias(materiasData)
      setPlanes(planesData)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar las comisiones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Comision -> Materia -> Plan de Estudio -> Carrera: no hay relacion
  // directa Comision-Carrera en el backend, se resuelve cruzando estos
  // 3 listados ya cargados.
  const carreraPorMateriaId = useMemo(() => {
    const planPorId = new Map(planes.map((p) => [p.id, p]))
    const mapa = new Map<number, { carreraId: number; carreraNombre: string }>()
    for (const materia of materias) {
      const plan = planPorId.get(materia.planEstudioId)
      if (plan) {
        mapa.set(materia.id, { carreraId: plan.carreraId, carreraNombre: plan.carreraNombre })
      }
    }
    return mapa
  }, [materias, planes])

  const carrerasDisponibles = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const plan of planes) {
      unicas.set(plan.carreraId, plan.carreraNombre)
    }
    return Array.from(unicas.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [planes])

  const comisionesFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return comisiones.filter((c) => {
      const coincideTexto =
        !term ||
        [c.nombre, c.materiaNombre, c.profesorNombre, c.profesorApellido].some((campo) =>
          campo?.toLowerCase().includes(term)
        )
      const carrera = carreraPorMateriaId.get(c.materiaId)
      const coincideCarrera = !carreraFiltro || String(carrera?.carreraId) === carreraFiltro
      return coincideTexto && coincideCarrera
    })
  }, [comisiones, searchTerm, carreraFiltro, carreraPorMateriaId])

  const abrirCrear = () => {
    setEditingComision(null)
    setFormOpen(true)
  }

  const abrirEditar = (comision: Comision) => {
    setEditingComision(comision)
    setFormOpen(true)
  }

  const abrirEliminar = (comision: Comision) => {
    setDeletingComision(comision)
    setDeleteOpen(true)
  }

  const handleGuardado = (comision: Comision) => {
    setComisiones((prev) => {
      const existe = prev.some((c) => c.id === comision.id)
      return existe ? prev.map((c) => (c.id === comision.id ? comision : c)) : [...prev, comision]
    })
  }

  const handleEliminado = (id: number) => {
    setComisiones((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Gestión de Comisiones</h1>
          <p className="text-sm text-muted-foreground">Materia, cuatrimestre y profesor a cargo de cada comisión</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nueva Comisión
        </Button>
      </div>

      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, materia o profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={carreraFiltro}
          onChange={(e) => setCarreraFiltro(e.target.value)}
          className={cn(selectClassName, "sm:max-w-xs")}
        >
          <option value="">Todas las carreras</option>
          {carrerasDisponibles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : comisiones.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : comisionesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">Ninguna comisión coincide con el filtro aplicado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Cuatrimestre</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Cupo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comisionesFiltradas.map((comision) => (
                <TableRow key={comision.id}>
                  <TableCell className="font-medium">{comision.nombre}</TableCell>
                  <TableCell>{comision.materiaNombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {carreraPorMateriaId.get(comision.materiaId)?.carreraNombre || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {comision.cuatrimestreAnio} - {comision.cuatrimestreNumero}°
                  </TableCell>
                  <TableCell>
                    {comision.profesorApellido}, {comision.profesorNombre}
                  </TableCell>
                  <TableCell>{comision.cupo}</TableCell>
                  <TableCell>
                    <Badge variant={comision.activa ? "default" : "secondary"}>
                      {comision.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/comisiones/${comision.id}`}>
                        <Button variant="ghost" size="icon" aria-label="Ver dashboard">
                          <LayoutDashboard className="size-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(comision)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEliminar(comision)} aria-label="Eliminar">
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

      <ComisionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        comision={editingComision}
        onSuccess={handleGuardado}
      />
      <EliminarComisionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        comision={deletingComision}
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
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay comisiones</p>
        <p className="text-sm text-muted-foreground">Creá la primera para empezar a organizar el cursado.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nueva Comisión
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/comisiones/page.tsx
git commit -m "feat(frontend): filtro y columna de Carrera en Comisiones"
```

---

### Task 5: `comisiones.service.ts` — agregar obtenerComisionPorId

**Files:**
- Modify: `frontend/lib/services/comisiones.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Produces (agrega a lo existente): `obtenerComisionPorId(id: number): Promise<Comision>`.

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import apiClient from "@/lib/api-client"

// Coincide con ComisionResponse del Core. materiaNombre/cuatrimestreAnio/
// cuatrimestreNumero/profesorNombre/profesorApellido/profesorTitulo vienen
// denormalizados desde las entidades relacionadas -- no son editables aca.
export interface Comision {
  id: number
  nombre: string
  cupo: number
  activa: boolean
  materiaId: number
  materiaNombre: string
  cuatrimestreId: number
  cuatrimestreAnio: number
  cuatrimestreNumero: number
  profesorId: number
  profesorNombre: string
  profesorApellido: string
  profesorTitulo: string
}

// ComisionRequest del Core: no tiene "turno" -- la comision se define por
// Materia + Cuatrimestre + Profesor.
export interface ComisionInput {
  nombre: string
  cupo: number
  materiaId: number
  cuatrimestreId: number
  profesorId: number
  activa: boolean
}

const BASE_PATH = "/api/core/comisiones"

export async function listarComisiones(): Promise<Comision[]> {
  const response = await apiClient.get<Comision[]>(BASE_PATH)
  return response.data
}

export async function obtenerComisionPorId(id: number): Promise<Comision> {
  const response = await apiClient.get<Comision[]>(`${BASE_PATH}/${id}`)
  return response.data[0]
}

export async function crearComision(input: ComisionInput): Promise<Comision> {
  const response = await apiClient.post<Comision[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarComision(id: number, input: ComisionInput): Promise<Comision> {
  const response = await apiClient.put<Comision[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarComision(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/comisiones.service.ts
git commit -m "feat(frontend): agregar obtenerComisionPorId al service de Comisiones"
```

---

### Task 6: `inscripciones.service.ts` — agregar alta y baja de inscripción a materia

**Files:**
- Modify: `frontend/lib/services/inscripciones.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Produces (agrega a lo existente, `AlumnoInscripto` y `listarInscripciones` sin cambios): `InscripcionMateriaInput { alumnoCarreraId: number; comisionMateriaId: number }`, `crearInscripcionMateria(input: InscripcionMateriaInput): Promise<AlumnoInscripto>`, `eliminarInscripcionMateria(id: number): Promise<void>`.

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import apiClient from "@/lib/api-client"

// Coincide con AlumnoInscriptoResponse del Core. DTO aplanado (deuda tecnica
// #1 resuelta): antes solo traia alumnoCarreraId + un nombre armado, y habia
// que pedir /inscripciones-carreras/{id} por cada fila para resolver el
// alumnoId real. Ahora alumnoId/nombre/apellido/dni/legajo vienen directos,
// resueltos con un solo JOIN FETCH en el Core (ver AlumnoInscriptoRepository).
export interface AlumnoInscripto {
  id: number
  alumnoCarreraId: number
  alumnoId: number
  nombre: string
  apellido: string
  dni: string
  legajo: string
  comisionMateriaId: number
  materiaNombre: string
  comisionNombre: string
  estado: string
  notaFinal: number | null
}

export interface InscripcionMateriaInput {
  alumnoCarreraId: number
  comisionMateriaId: number
}

const BASE_PATH = "/api/core/inscripciones-materias"

// No hay filtro por comisionMateriaId en el Core todavia: se trae todo y se
// filtra en el cliente (mismo patron que ms-asistencias, que tampoco filtra).
export async function listarInscripciones(): Promise<AlumnoInscripto[]> {
  const response = await apiClient.get<AlumnoInscripto[]>(BASE_PATH)
  return response.data
}

export async function crearInscripcionMateria(input: InscripcionMateriaInput): Promise<AlumnoInscripto> {
  const response = await apiClient.post<AlumnoInscripto[]>(BASE_PATH, input)
  return response.data[0]
}

export async function eliminarInscripcionMateria(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/inscripciones.service.ts
git commit -m "feat(frontend): agregar alta y baja de inscripción a materia"
```

---

### Task 7: `roster.service.ts` — extender AlumnoRoster (aditivo)

**Files:**
- Modify: `frontend/lib/services/roster.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Consumes: `AlumnoInscripto`, `listarInscripciones` (Task 6, sin cambio de firma).
- Produces: `AlumnoRoster { id: number; alumnoId: number; nombreCompleto: string; dni: string; legajo: string }` (agrega `id`, `dni`, `legajo` — `alumnoId`/`nombreCompleto` se mantienen igual para no romper a Asistencias/Calificaciones), `obtenerRosterComision(comisionId: number): Promise<AlumnoRoster[]>` (misma firma).

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import { listarInscripciones } from "@/lib/services/inscripciones.service"

// Resuelve la lista de alumnos inscriptos en una comision. Compartido entre
// Asistencias, Calificaciones e Inscripcion de Alumnos para no duplicar el
// filtrado. `id` (de la inscripcion) se agrega para poder dar de baja desde
// la nomina -- alumnoId/nombreCompleto se mantienen igual para no romper a
// los consumidores existentes.
//
// Antes esto hacia 1 + N llamadas: listar inscripciones y despues, por cada
// fila, GET /api/inscripciones-carreras/{id} para resolver el alumnoId real
// (deuda_tecnica.md #1). El Core ahora devuelve alumnoId/nombre/apellido ya
// resueltos con un JOIN FETCH en una sola consulta, asi que esto es un solo
// fetch + un filtro en memoria -- sin peticiones en cascada.
export interface AlumnoRoster {
  id: number
  alumnoId: number
  nombreCompleto: string
  dni: string
  legajo: string
}

export async function obtenerRosterComision(comisionId: number): Promise<AlumnoRoster[]> {
  const inscripciones = await listarInscripciones()

  return inscripciones
    .filter((i) => i.comisionMateriaId === comisionId)
    .map((i) => ({
      id: i.id,
      alumnoId: i.alumnoId,
      nombreCompleto: `${i.nombre} ${i.apellido}`,
      dni: i.dni,
      legajo: i.legajo,
    }))
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos. Los consumidores existentes de `obtenerRosterComision` (Asistencias, Calificaciones) siguen compilando: solo usan `alumnoId`/`nombreCompleto`, que no cambiaron.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/roster.service.ts
git commit -m "feat(frontend): extender AlumnoRoster con id/dni/legajo (aditivo)"
```

---

### Task 8: `alumnos.service.ts` — agregar búsqueda por DNI

**Files:**
- Modify: `frontend/lib/services/alumnos.service.ts` (reemplazo completo del archivo)

**Interfaces:**
- Produces (agrega a lo existente): `buscarAlumnoPorDni(dni: string): Promise<Alumno>`.

- [ ] **Step 1: Reemplazar el archivo completo**

```ts
import apiClient from "@/lib/api-client"

// Coincide con AlumnoResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
// telefonoSecundario si es editable (dato opcional de contacto).
export interface Alumno {
  id: number
  legajo: string
  activo: boolean
  userId: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario: string
}

// POST /api/core/alumnos ahora es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=ALUMNO) y el Alumno en
// la misma transaccion (ver docs/Reglas_de_Negocio.md y AlumnoRegistroDTO).
// El legajo ya no se pide: el Core lo autogenera como AAAA-DNI.
export interface CrearAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario?: string
}

// AlumnoUpdateRequest del Core: legajo NO es editable (vive en el Usuario,
// es identidad de por vida) -- pero nombre/apellido/dni/email si lo son, y
// si el dni cambia el Core recalcula el legajo automaticamente.
export interface ActualizarAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  activo: boolean
  telefonoSecundario?: string
}

const BASE_PATH = "/api/core/alumnos"

export async function listarAlumnos(): Promise<Alumno[]> {
  const response = await apiClient.get<Alumno[]>(BASE_PATH)
  return response.data
}

export async function buscarAlumnoPorDni(dni: string): Promise<Alumno> {
  const response = await apiClient.get<Alumno[]>(`${BASE_PATH}/dni/${dni}`)
  return response.data[0]
}

export async function crearAlumno(input: CrearAlumnoInput): Promise<Alumno> {
  const response = await apiClient.post<Alumno[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAlumno(id: number, input: ActualizarAlumnoInput): Promise<Alumno> {
  const response = await apiClient.put<Alumno[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarAlumno(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/alumnos.service.ts
git commit -m "feat(frontend): agregar búsqueda de alumno por DNI"
```

---

### Task 9: `comision-dashboard.tsx` — de placeholder a datos reales

**Files:**
- Modify: `frontend/components/academico/comision-dashboard.tsx` (reemplazo completo del archivo)

**Interfaces:**
- Consumes: `Comision`, `obtenerComisionPorId` (Task 5); `Materia`, `listarMaterias` (ya existe); `PlanEstudio`, `listarPlanesEstudio` (ya existe).
- Produces: `ComisionDashboard({ comisionId })` sigue con la misma firma (prop `comisionId: string`, sin cambios para `frontend/app/dashboard/comisiones/[id]/page.tsx`, que no se toca en este plan). Internamente ahora resuelve y expone `carreraId`/`carreraNombre` que consume `RosterComisionView` en Task 10.

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { obtenerComisionPorId, type Comision } from "@/lib/services/comisiones.service"
import { listarMaterias, type Materia } from "@/lib/services/materias.service"
import { listarPlanesEstudio, type PlanEstudio } from "@/lib/services/planes-estudio.service"
import { RosterComisionView } from "@/components/comisiones/roster-comision-view"

export function ComisionDashboard({ comisionId }: { comisionId: string }) {
  const [comision, setComision] = useState<Comision | null>(null)
  const [carreraId, setCarreraId] = useState<number | null>(null)
  const [carreraNombre, setCarreraNombre] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = Number(comisionId)

    setLoading(true)
    Promise.all([obtenerComisionPorId(id), listarMaterias(), listarPlanesEstudio()])
      .then(([comisionData, materias, planes]) => {
        setComision(comisionData)

        const materia = materias.find((m: Materia) => m.id === comisionData.materiaId)
        const plan = materia ? planes.find((p: PlanEstudio) => p.id === materia.planEstudioId) : undefined
        if (plan) {
          setCarreraId(plan.carreraId)
          setCarreraNombre(plan.carreraNombre)
        }
      })
      .catch((err: any) => {
        toast.error(err?.message || "No se pudo cargar la comisión")
      })
      .finally(() => setLoading(false))
  }, [comisionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando comisión...
      </div>
    )
  }

  if (!comision) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No se encontró la comisión.</p>
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{comision.nombre}</h1>
        <p className="text-muted-foreground">
          Materia: {comision.materiaNombre}
          {carreraNombre && <> | Carrera: {carreraNombre}</>} | Profesor: {comision.profesorNombre}{" "}
          {comision.profesorApellido} | Cuatrimestre: {comision.cuatrimestreAnio} - {comision.cuatrimestreNumero}°
        </p>
      </div>

      <Tabs defaultValue="alumnos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alumnos">Alumnos Inscriptos</TabsTrigger>
          <TabsTrigger value="notas">Exámenes y Notas</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>
        <TabsContent value="alumnos">
          <RosterComisionView comisionId={comision.id} carreraId={carreraId} carreraNombre={carreraNombre} />
        </TabsContent>
        <TabsContent value="notas">
          <div className="p-4 border rounded-md mt-4">Gestión de Notas</div>
        </TabsContent>
        <TabsContent value="asistencias">
          <div className="p-4 border rounded-md mt-4">Toma de Asistencia</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Este archivo importa `RosterComisionView` desde `@/components/comisiones/roster-comision-view`, que recién se crea en la Task 10 — es esperable que `tsc` falle en este paso puntual con `Cannot find module`. Se deja así porque el plan sigue en orden a la Task 10 inmediatamente después; no se hace commit de este archivo todavía.

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -i "comision-dashboard"`
Expected: **un** error esperado: `Cannot find module '@/components/comisiones/roster-comision-view'`. Ningún otro error nuevo relacionado a este archivo.

- [ ] **Step 3: No commitear todavía** — continuar directo a la Task 10, que crea el módulo faltante y sí commitea ambos archivos juntos.

---

### Task 10: Nómina de la Comisión + Inscribir alumno por DNI

**Files:**
- Create: `frontend/components/comisiones/roster-comision-view.tsx`
- Create: `frontend/components/comisiones/inscribir-alumno-dialog.tsx`

**Interfaces:**
- Consumes: `AlumnoRoster`, `obtenerRosterComision` (Task 7); `eliminarInscripcionMateria`, `crearInscripcionMateria` (Task 6); `buscarAlumnoPorDni`, `Alumno` (Task 8); `listarInscripcionesCarreraPorAlumno` (Task 1); `ComisionDashboard` (Task 9) ya pasa `comisionId: number`, `carreraId: number | null`, `carreraNombre: string` a `RosterComisionView`.
- Produces: `RosterComisionView({ comisionId, carreraId, carreraNombre })`.

- [ ] **Step 1: Crear el dialog de inscripción por DNI**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
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
import { buscarAlumnoPorDni, type Alumno } from "@/lib/services/alumnos.service"
import { listarInscripcionesCarreraPorAlumno } from "@/lib/services/inscripciones-carreras.service"
import { crearInscripcionMateria, type AlumnoInscripto } from "@/lib/services/inscripciones.service"

interface InscribirAlumnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comisionId: number
  carreraId: number | null
  carreraNombre: string
  onSuccess: (inscripcion: AlumnoInscripto) => void
}

export function InscribirAlumnoDialog({
  open,
  onOpenChange,
  comisionId,
  carreraId,
  carreraNombre,
  onSuccess,
}: InscribirAlumnoDialogProps) {
  const [dni, setDni] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [alumnoCarreraId, setAlumnoCarreraId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inscribiendo, setInscribiendo] = useState(false)

  useEffect(() => {
    if (!open) return
    setDni("")
    setAlumno(null)
    setAlumnoCarreraId(null)
    setError(null)
  }, [open])

  const handleBuscar = async () => {
    if (!dni.trim()) {
      setError("Ingresá un DNI")
      return
    }

    setBuscando(true)
    setError(null)
    setAlumno(null)
    setAlumnoCarreraId(null)
    try {
      const encontrado = await buscarAlumnoPorDni(dni.trim())
      setAlumno(encontrado)

      const inscripcionesCarrera = await listarInscripcionesCarreraPorAlumno(encontrado.id)
      const match = inscripcionesCarrera.find((i) => i.carreraId === carreraId)

      if (match) {
        setAlumnoCarreraId(match.id)
      } else {
        setError(
          `${encontrado.nombre} ${encontrado.apellido} no está inscripto en ${carreraNombre || "esta carrera"}. Inscribilo primero desde Alumnos.`
        )
      }
    } catch (err: any) {
      setError(err?.message || "No se encontró un alumno con ese DNI")
    } finally {
      setBuscando(false)
    }
  }

  const handleInscribir = async () => {
    if (!alumnoCarreraId) return

    setInscribiendo(true)
    setError(null)
    try {
      const inscripcion = await crearInscripcionMateria({
        alumnoCarreraId,
        comisionMateriaId: comisionId,
      })
      toast.success("Alumno inscripto en la comisión correctamente")
      onSuccess(inscripcion)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo inscribir al alumno en la comisión"
      setError(message)
      toast.error(message)
    } finally {
      setInscribiendo(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Inscribir alumno</DialogTitle>
          <DialogDescription>Buscá al alumno por DNI para inscribirlo en esta comisión.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej. 30123456"
                disabled={buscando}
              />
              <Button type="button" onClick={handleBuscar} disabled={buscando}>
                {buscando ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Buscar
              </Button>
            </div>
          </div>

          {alumno && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium text-foreground">
                {alumno.nombre} {alumno.apellido}
              </p>
              <p className="text-muted-foreground">DNI {alumno.dni} — Legajo {alumno.legajo || "—"}</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={inscribiendo}>
            Cancelar
          </Button>
          <Button onClick={handleInscribir} disabled={!alumnoCarreraId || inscribiendo}>
            {inscribiendo && <Loader2 className="size-4 animate-spin" />}
            Inscribir a la comisión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Crear la vista de nómina**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { obtenerRosterComision, type AlumnoRoster } from "@/lib/services/roster.service"
import { eliminarInscripcionMateria, type AlumnoInscripto } from "@/lib/services/inscripciones.service"
import { InscribirAlumnoDialog } from "./inscribir-alumno-dialog"

interface RosterComisionViewProps {
  comisionId: number
  carreraId: number | null
  carreraNombre: string
}

export function RosterComisionView({ comisionId, carreraId, carreraNombre }: RosterComisionViewProps) {
  const [roster, setRoster] = useState<AlumnoRoster[]>([])
  const [loading, setLoading] = useState(true)
  const [inscribirOpen, setInscribirOpen] = useState(false)

  const cargarRoster = async () => {
    setLoading(true)
    try {
      const data = await obtenerRosterComision(comisionId)
      setRoster(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cargar la nómina de la comisión")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRoster()
  }, [comisionId])

  const handleQuitar = async (alumno: AlumnoRoster) => {
    try {
      await eliminarInscripcionMateria(alumno.id)
      setRoster((prev) => prev.filter((a) => a.id !== alumno.id))
      toast.success("Alumno desinscripto de la comisión correctamente")
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desinscribir al alumno")
    }
  }

  const handleInscripto = (inscripcion: AlumnoInscripto) => {
    setRoster((prev) => [
      ...prev,
      {
        id: inscripcion.id,
        alumnoId: inscripcion.alumnoId,
        nombreCompleto: `${inscripcion.nombre} ${inscripcion.apellido}`,
        dni: inscripcion.dni,
        legajo: inscripcion.legajo,
      },
    ])
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{roster.length} alumno(s) inscripto(s)</p>
        <Button size="sm" onClick={() => setInscribirOpen(true)}>
          <Plus className="size-4" />
          Inscribir alumno
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : roster.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border p-12 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">Todavía no hay alumnos inscriptos</p>
          <p className="text-sm text-muted-foreground">Usá "Inscribir alumno" para agregar el primero por DNI.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Legajo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell className="font-medium">{alumno.nombreCompleto}</TableCell>
                <TableCell>{alumno.dni}</TableCell>
                <TableCell>{alumno.legajo || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleQuitar(alumno)} aria-label="Quitar">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <InscribirAlumnoDialog
        open={inscribirOpen}
        onOpenChange={setInscribirOpen}
        comisionId={comisionId}
        carreraId={carreraId}
        carreraNombre={carreraNombre}
        onSuccess={handleInscripto}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos de todo el proyecto**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errores relacionados a `comision-dashboard.tsx`, `roster-comision-view.tsx` o `inscribir-alumno-dialog.tsx`. El error puntual de la Task 9 (módulo faltante) ya no aparece.

- [ ] **Step 4: Commit (incluye el archivo pendiente de la Task 9)**

```bash
git add frontend/components/academico/comision-dashboard.tsx frontend/components/comisiones/roster-comision-view.tsx frontend/components/comisiones/inscribir-alumno-dialog.tsx
git commit -m "feat(frontend): dashboard de Comisión con nómina real e inscripción por DNI"
```

---

## Después de completar todos los Tasks

Con los 10 tasks mergeados en `feature/inscripcion-alumnos-carrera-comision`:
1. Levantar el stack y probar manualmente en el navegador: alta de alumno → `/dashboard/alumnos` → "Inscribir en Carrera" → elegir carrera/plan/año → `/dashboard/comisiones` → filtrar por esa carrera → "Ver dashboard" de una comisión de esa carrera → tab "Alumnos Inscriptos" → "Inscribir alumno" por DNI → verificar que aparece en la nómina y que "Quitar" funciona en ambos niveles (carrera y comisión).
2. Caso de error a verificar a mano: buscar por DNI un alumno que NO esté inscripto en la carrera de esa comisión — debe mostrar el mensaje de error sin inscribir nada.
3. Seguir `superpowers:finishing-a-development-branch` para el merge fast-forward a `develop`.
