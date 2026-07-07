"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2, GraduationCap, BookOpen, FileText } from "lucide-react"
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
                      <Button variant="ghost" size="icon" asChild aria-label="Ver Ficha">
                        <Link href={`/dashboard/alumnos/${alumno.id}`}>
                          <FileText className="size-4" />
                        </Link>
                      </Button>
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
