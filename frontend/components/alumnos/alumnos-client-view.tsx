"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Search, Pencil, Trash2, GraduationCap, FileText } from "lucide-react"
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
import { AlumnoFormDialog } from "@/components/alumnos/alumno-form-dialog"
import { EliminarAlumnoDialog } from "@/components/alumnos/eliminar-alumno-dialog"
import { RequireRole } from "@/components/auth/require-role"
import type { Alumno } from "@/lib/services/alumnos.service"

export function AlumnosClientView({ initialAlumnos }: { initialAlumnos: Alumno[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingAlumno, setDeletingAlumno] = useState<Alumno | null>(null)

  const alumnosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return initialAlumnos
    return initialAlumnos.filter((a) =>
      [a.nombre, a.apellido, a.dni, a.email, a.legajo].some((campo) =>
        campo?.toLowerCase().includes(term)
      )
    )
  }, [initialAlumnos, searchTerm])

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
          {initialAlumnos.length === 0 ? (
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
                        <Button variant="ghost" size="icon" asChild aria-label="Ver Ficha">
                          <Link href={`/dashboard/alumnos/${alumno.id}`}>
                            <FileText className="size-4" />
                          </Link>
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
        />
        <EliminarAlumnoDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          alumno={deletingAlumno}
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
