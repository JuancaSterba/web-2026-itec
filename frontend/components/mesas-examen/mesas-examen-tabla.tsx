"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ArrowUpDown } from "lucide-react"

export interface MesaExamenItem {
  id: number
  materiaNombre: string
  cicloAnio: number
  cicloLectivoId: number
  turno: "PRIMER_TURNO" | "SEGUNDO_TURNO" | "TERCER_TURNO" | null
  tipo: "ORDINARIA_1ER_LLAMADO" | "ORDINARIA_2DO_LLAMADO" | "ESPECIAL"
  fechaHora: string
  fechaHoraFormateada: string
  estado: "PROGRAMADA" | "CERRADA"
  tribunalNombres: string[]
}

interface Props {
  mesas: MesaExamenItem[]
  ciclosDisponibles: { id: number; anio: number }[]
}



export function MesasExamenTabla({ mesas, ciclosDisponibles }: Props) {
  const [busqueda, setBusqueda] = useState("")
  const [cicloFiltro, setCicloFiltro] = useState<string>("TODOS")
  const [turnoFiltro, setTurnoFiltro] = useState<string>("TODOS")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("TODOS")
  const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc">("asc")

  const mesasFiltradasYOrdenadas = useMemo(() => {
    return mesas
      .filter((m) => {
        // Filtro por texto (materia o docente)
        const matchTexto =
          m.materiaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.tribunalNombres.some((t) => t.toLowerCase().includes(busqueda.toLowerCase()))
        if (!matchTexto) return false

        // Filtro por ciclo lectivo
        if (cicloFiltro !== "TODOS" && m.cicloLectivoId !== Number(cicloFiltro)) {
          return false
        }

        // Filtro por turno
        if (turnoFiltro !== "TODOS" && m.turno !== turnoFiltro) {
          return false
        }

        // Filtro por estado
        if (estadoFiltro !== "TODOS" && m.estado !== estadoFiltro) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.fechaHora).getTime()
        const timeB = new Date(b.fechaHora).getTime()
        return ordenFecha === "asc" ? timeA - timeB : timeB - timeA
      })
  }, [mesas, busqueda, cicloFiltro, turnoFiltro, estadoFiltro, ordenFecha])

  const toggleOrdenFecha = () => {
    setOrdenFecha((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por materia o docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Ciclo Lectivo */}
          <select
            value={cicloFiltro}
            onChange={(e) => setCicloFiltro(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="TODOS">Todos los Ciclos</option>
            {ciclosDisponibles.map((c) => (
              <option key={c.id} value={c.id}>
                Ciclo {c.anio}
              </option>
            ))}
          </select>

          {/* Filtro por Turno */}
          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="TODOS">Todos los Turnos</option>
            <option value="PRIMER_TURNO">1er Turno (Jun/Jul)</option>
            <option value="SEGUNDO_TURNO">2do Turno (Nov/Dic)</option>
            <option value="TERCER_TURNO">3er Turno (Feb/Mar)</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="CERRADA">Cerrada</option>
          </select>
        </div>
      </div>

      {/* Resultados de Tabla */}
      {mesasFiltradasYOrdenadas.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No se encontraron mesas de examen con los filtros aplicados.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Materia</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={toggleOrdenFecha}
                  className="flex items-center gap-1 hover:text-foreground font-semibold"
                >
                  Fecha y Hora
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Tipo / Llamado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tribunal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mesasFiltradasYOrdenadas.map((mesa) => (
              <TableRow key={mesa.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/mesas-examen/${mesa.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {mesa.materiaNombre}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    {mesa.cicloAnio ? `Ciclo ${mesa.cicloAnio}` : "-"}
                  </span>
                </TableCell>
                <TableCell>{mesa.fechaHoraFormateada}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {mesa.tipo === "ORDINARIA_1ER_LLAMADO" && "Ordinaria (1er Llamado)"}
                    {mesa.tipo === "ORDINARIA_2DO_LLAMADO" && "Ordinaria (2do Llamado)"}
                    {mesa.tipo === "ESPECIAL" && "Especial"}
                  </span>
                  {mesa.turno && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({mesa.turno.replace("_", " ").toLowerCase()})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={mesa.estado === "PROGRAMADA" ? "default" : "secondary"}>
                    {mesa.estado === "PROGRAMADA" ? "Programada" : "Cerrada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {mesa.tribunalNombres.length === 0
                    ? "Sin tribunal asignado"
                    : mesa.tribunalNombres.join(" · ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
