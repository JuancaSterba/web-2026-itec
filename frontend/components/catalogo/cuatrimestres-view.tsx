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
