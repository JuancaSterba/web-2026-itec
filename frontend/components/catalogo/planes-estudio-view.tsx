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
