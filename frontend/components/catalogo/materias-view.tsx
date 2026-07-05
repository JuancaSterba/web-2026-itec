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
