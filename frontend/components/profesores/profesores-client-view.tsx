"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProfesorFormDialog } from "@/components/profesores/profesor-form-dialog"
import { EliminarProfesorDialog } from "@/components/profesores/eliminar-profesor-dialog"
import { RequireRole } from "@/components/auth/require-role"
import type { Profesor } from "@/lib/services/profesores.service"

export function ProfesoresClientView({ initialProfesores }: { initialProfesores: Profesor[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProfesor, setDeletingProfesor] = useState<Profesor | null>(null)

  const profesoresFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return initialProfesores
    return initialProfesores.filter((p) =>
      [p.nombre, p.apellido, p.dni, p.email, p.titulo].some((campo) =>
        campo?.toLowerCase().includes(term)
      )
    )
  }, [initialProfesores, searchTerm])

  const abrirCrear = () => {
    setEditingProfesor(null)
    setFormOpen(true)
  }

  const abrirEditar = (profesor: Profesor) => {
    setEditingProfesor(profesor)
    setFormOpen(true)
  }

  const abrirEliminar = (profesor: Profesor) => {
    setDeletingProfesor(profesor)
    setDeleteOpen(true)
  }

  return (
    <RequireRole roles={["ADMIN", "ADMINISTRATIVO"]}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Gestión de Profesores</h1>
            <p className="text-sm text-muted-foreground">Administra el cuerpo docente del instituto</p>
          </div>
          <Button onClick={abrirCrear}>
            <Plus className="size-4" />
            Nuevo Profesor
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI, email o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        <Card>
          {initialProfesores.length === 0 ? (
            <EmptyState onCrear={abrirCrear} />
          ) : profesoresFiltrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Search className="size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                Ningún profesor coincide con &ldquo;{searchTerm}&rdquo;.
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
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profesoresFiltrados.map((profesor) => (
                  <TableRow key={profesor.id}>
                    <TableCell className="font-medium">{profesor.nombre}</TableCell>
                    <TableCell>{profesor.apellido}</TableCell>
                    <TableCell>{profesor.dni}</TableCell>
                    <TableCell className="text-muted-foreground">{profesor.email}</TableCell>
                    <TableCell>{profesor.titulo || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={profesor.activo ? "default" : "secondary"}>
                        {profesor.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(profesor)} aria-label="Editar">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => abrirEliminar(profesor)} aria-label="Eliminar">
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

        <ProfesorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          profesor={editingProfesor}
        />
        <EliminarProfesorDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          profesor={deletingProfesor}
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
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay profesores</p>
        <p className="text-sm text-muted-foreground">Creá el primero para empezar a armar el cuerpo docente.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Profesor
      </Button>
    </div>
  )
}
