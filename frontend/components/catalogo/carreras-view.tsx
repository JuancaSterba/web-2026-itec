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
