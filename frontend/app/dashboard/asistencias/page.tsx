"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ClipboardCheck, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EstadoAsistenciaToggle } from "@/components/asistencias/estado-asistencia-toggle"
import { listarComisiones, type Comision } from "@/lib/services/comisiones.service"
import { obtenerRosterComision } from "@/lib/services/roster.service"
import {
  listarAsistencias,
  registrarAsistencia,
  actualizarAsistencia,
  type EstadoAsistencia,
} from "@/lib/services/asistencias.service"

// @radix-ui/react-select no esta instalado (ver ComisionFormDialog): select
// nativo con la misma estetica que Input.
const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"

interface RosterItem {
  alumnoId: number
  nombreCompleto: string
  asistenciaId: number | null
  estado: EstadoAsistencia | null
  saving: boolean
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function AsistenciasPage() {
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [loadingComisiones, setLoadingComisiones] = useState(true)

  const [comisionId, setComisionId] = useState("")
  const [fecha, setFecha] = useState(hoyISO())

  const [roster, setRoster] = useState<RosterItem[]>([])
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [rosterCargado, setRosterCargado] = useState(false)

  useEffect(() => {
    listarComisiones()
      .then(setComisiones)
      .catch((err: any) => toast.error(err?.message || "No se pudieron cargar las comisiones"))
      .finally(() => setLoadingComisiones(false))
  }, [])

  useEffect(() => {
    if (!comisionId || !fecha) {
      setRoster([])
      setRosterCargado(false)
      return
    }

    let cancelado = false
    setLoadingRoster(true)

    const cargar = async () => {
      try {
        // Orquestacion entre Core y ms-asistencias (API Composition Pattern):
        // el Core sabe quien esta inscripto en la comision (roster.service.ts
        // resuelve el alumnoId real, ver docs/deuda_tecnica.md #1). ms-asistencias
        // sabe el estado pero no el nombre de nadie.
        const [roster, asistencias] = await Promise.all([
          obtenerRosterComision(Number(comisionId)),
          listarAsistencias(Number(comisionId), fecha),
        ])

        const nuevoRoster: RosterItem[] = roster.map(({ alumnoId, nombreCompleto }) => {
          const existente = asistencias.find((a) => a.alumnoId === alumnoId)
          return {
            alumnoId,
            nombreCompleto,
            asistenciaId: existente?.id ?? null,
            estado: existente?.estado ?? null,
            saving: false,
          }
        })

        if (!cancelado) setRoster(nuevoRoster)
      } catch (err: any) {
        if (!cancelado) {
          toast.error(err?.message || "No se pudo cargar la lista de alumnos")
          setRoster([])
        }
      } finally {
        if (!cancelado) {
          setLoadingRoster(false)
          setRosterCargado(true)
        }
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [comisionId, fecha])

  const comisionSeleccionada = useMemo(
    () => comisiones.find((c) => c.id === Number(comisionId)),
    [comisiones, comisionId]
  )

  const handleCambiarEstado = async (alumnoId: number, nuevoEstado: EstadoAsistencia) => {
    const actual = roster.find((r) => r.alumnoId === alumnoId)
    if (!actual) return
    const estadoPrevio = actual.estado

    // Optimista: se ve el cambio al instante, se guarda en background.
    setRoster((prev) =>
      prev.map((r) => (r.alumnoId === alumnoId ? { ...r, estado: nuevoEstado, saving: true } : r))
    )

    try {
      if (actual.asistenciaId) {
        await actualizarAsistencia(actual.asistenciaId, {
          alumnoId,
          comisionId: Number(comisionId),
          fecha,
          estado: nuevoEstado,
        })
        setRoster((prev) => prev.map((r) => (r.alumnoId === alumnoId ? { ...r, saving: false } : r)))
      } else {
        const creada = await registrarAsistencia({
          alumnoId,
          comisionId: Number(comisionId),
          fecha,
          estado: nuevoEstado,
        })
        setRoster((prev) =>
          prev.map((r) => (r.alumnoId === alumnoId ? { ...r, asistenciaId: creada.id, saving: false } : r))
        )
      }
    } catch (err: any) {
      toast.error(err?.message || "No se pudo guardar la asistencia")
      // Revierte el optimismo si el guardado falla.
      setRoster((prev) =>
        prev.map((r) => (r.alumnoId === alumnoId ? { ...r, estado: estadoPrevio, saving: false } : r))
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Toma de Asistencia</h1>
        <p className="text-sm text-muted-foreground">Elegí comisión y fecha para marcar presentes, tarde o ausentes</p>
      </div>

      <Card glass className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="comision">Comisión</Label>
            <select
              id="comision"
              value={comisionId}
              onChange={(e) => setComisionId(e.target.value)}
              disabled={loadingComisiones}
              className={selectClassName}
            >
              <option value="">Seleccioná una comisión</option>
              {comisiones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {c.materiaNombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        {!comisionId ? (
          <div className="flex flex-col items-center gap-2 p-16 text-center">
            <ClipboardCheck className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Elegí una comisión</p>
            <p className="text-sm text-muted-foreground">La lista de alumnos aparece acá una vez que la seleccionás.</p>
          </div>
        ) : loadingRoster ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : rosterCargado && roster.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-16 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin alumnos inscriptos</p>
            <p className="text-sm text-muted-foreground">
              {comisionSeleccionada?.nombre ?? "Esta comisión"} todavía no tiene alumnos inscriptos.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead className="text-right">Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((item) => (
                <TableRow key={item.alumnoId}>
                  <TableCell className="font-medium">{item.nombreCompleto}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <EstadoAsistenciaToggle
                        value={item.estado}
                        saving={item.saving}
                        onChange={(estado) => handleCambiarEstado(item.alumnoId, estado)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
