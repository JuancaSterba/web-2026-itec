"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { obtenerRosterComision } from "@/lib/services/roster.service"
import { listarNotas, registrarNota, actualizarNota } from "@/lib/services/notas.service"

interface NotaRow {
  alumnoId: number
  nombreCompleto: string
  notaId: number | null
  valor: string
  valorGuardado: string | null
  saving: boolean
}

interface NotasTableProps {
  comisionId: number
  examenId: number
}

export function NotasTable({ comisionId, examenId }: NotasTableProps) {
  const [rows, setRows] = useState<NotaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelado = false
    setLoading(true)

    const cargar = async () => {
      try {
        const [roster, notas] = await Promise.all([
          obtenerRosterComision(comisionId),
          listarNotas(),
        ])
        const notasDelExamen = notas.filter((n) => n.examenId === examenId)

        const nuevasFilas: NotaRow[] = roster.map(({ alumnoId, nombreCompleto }) => {
          const existente = notasDelExamen.find((n) => n.alumnoId === alumnoId)
          const valor = existente ? String(existente.valor) : ""
          return {
            alumnoId,
            nombreCompleto,
            notaId: existente?.id ?? null,
            valor,
            valorGuardado: existente ? valor : null,
            saving: false,
          }
        })

        if (!cancelado) setRows(nuevasFilas)
      } catch (err: any) {
        if (!cancelado) toast.error(err?.message || "No se pudieron cargar las notas")
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [comisionId, examenId])

  const setValor = (alumnoId: number, valor: string) => {
    setRows((prev) => prev.map((r) => (r.alumnoId === alumnoId ? { ...r, valor } : r)))
  }

  const handleBlur = async (alumnoId: number) => {
    const fila = rows.find((r) => r.alumnoId === alumnoId)
    if (!fila) return

    const valorLimpio = fila.valor.trim()
    if (valorLimpio === (fila.valorGuardado ?? "")) return // sin cambios, no guarda de nuevo

    if (valorLimpio === "") return // no borra notas vaciando el input

    const numero = Number(valorLimpio)
    if (Number.isNaN(numero)) {
      toast.error("La nota debe ser un número")
      setRows((prev) =>
        prev.map((r) => (r.alumnoId === alumnoId ? { ...r, valor: r.valorGuardado ?? "" } : r))
      )
      return
    }

    setRows((prev) => prev.map((r) => (r.alumnoId === alumnoId ? { ...r, saving: true } : r)))

    try {
      if (fila.notaId) {
        await actualizarNota(fila.notaId, { examenId, alumnoId, valor: numero })
        setRows((prev) =>
          prev.map((r) => (r.alumnoId === alumnoId ? { ...r, valorGuardado: valorLimpio, saving: false } : r))
        )
      } else {
        const creada = await registrarNota({ examenId, alumnoId, valor: numero })
        setRows((prev) =>
          prev.map((r) =>
            r.alumnoId === alumnoId
              ? { ...r, notaId: creada.id, valorGuardado: valorLimpio, saving: false }
              : r
          )
        )
      }
    } catch (err: any) {
      toast.error(err?.message || "No se pudo guardar la nota")
      setRows((prev) =>
        prev.map((r) => (r.alumnoId === alumnoId ? { ...r, valor: r.valorGuardado ?? "", saving: false } : r))
      )
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (rows.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-2 p-16 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">Sin alumnos inscriptos</p>
          <p className="text-sm text-muted-foreground">Esta comisión todavía no tiene alumnos inscriptos.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead className="text-right">Nota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.alumnoId}>
              <TableCell className="font-medium">{row.nombreCompleto}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {row.saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={row.valor}
                    onChange={(e) => setValor(row.alumnoId, e.target.value)}
                    onBlur={() => handleBlur(row.alumnoId)}
                    disabled={row.saving}
                    className="w-24 text-right"
                    placeholder="—"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
