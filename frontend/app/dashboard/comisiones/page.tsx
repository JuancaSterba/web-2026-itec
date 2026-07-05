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
