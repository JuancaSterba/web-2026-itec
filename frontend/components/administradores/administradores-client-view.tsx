"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Pencil, KeyRound, ShieldCheck } from "lucide-react"
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
import { AdministradorFormDialog } from "@/components/administradores/administrador-form-dialog"
import { ResetPasswordAdministradorDialog } from "@/components/administradores/reset-password-administrador-dialog"
import { RequireRole } from "@/components/auth/require-role"
import type { Administrador } from "@/lib/services/administradores.service"

export function AdministradoresClientView({ initialAdministradores }: { initialAdministradores: Administrador[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingAdministrador, setEditingAdministrador] = useState<Administrador | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resettingAdministrador, setResettingAdministrador] = useState<Administrador | null>(null)

  const administradoresFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return initialAdministradores
    return initialAdministradores.filter((a) =>
      [a.nombre, a.apellido, a.dni, a.email].some((campo) => campo?.toLowerCase().includes(term))
    )
  }, [initialAdministradores, searchTerm])

  const abrirCrear = () => {
    setEditingAdministrador(null)
    setFormOpen(true)
  }

  const abrirEditar = (administrador: Administrador) => {
    setEditingAdministrador(administrador)
    setFormOpen(true)
  }

  const abrirReset = (administrador: Administrador) => {
    setResettingAdministrador(administrador)
    setResetOpen(true)
  }

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Gestión de Administradores</h1>
            <p className="text-sm text-muted-foreground">Administra los usuarios ADMIN y ADMINISTRATIVO</p>
          </div>
          <Button onClick={abrirCrear}>
            <Plus className="size-4" />
            Nuevo Administrador
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        <Card>
          {initialAdministradores.length === 0 ? (
            <EmptyState onCrear={abrirCrear} />
          ) : administradoresFiltrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Search className="size-8 text-muted-foreground" />
              <p className="font-medium text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                Ningún administrador coincide con &ldquo;{searchTerm}&rdquo;.
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
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administradoresFiltrados.map((administrador) => (
                  <TableRow key={administrador.id}>
                    <TableCell className="font-medium">{administrador.nombre}</TableCell>
                    <TableCell>{administrador.apellido}</TableCell>
                    <TableCell>{administrador.dni}</TableCell>
                    <TableCell className="text-muted-foreground">{administrador.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {administrador.roles.map((rol) => (
                          <Badge key={rol} variant="outline">
                            {rol}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={administrador.enabled ? "default" : "secondary"}>
                        {administrador.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => abrirEditar(administrador)} aria-label="Editar">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => abrirReset(administrador)} aria-label="Resetear contraseña">
                          <KeyRound className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <AdministradorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          administrador={editingAdministrador}
        />
        <ResetPasswordAdministradorDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          administrador={resettingAdministrador}
        />
      </div>
    </RequireRole>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay administradores</p>
        <p className="text-sm text-muted-foreground">Creá el primero para empezar a delegar tareas.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Administrador
      </Button>
    </div>
  )
}
