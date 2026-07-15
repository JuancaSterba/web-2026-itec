"use client"

import { useState, type KeyboardEvent } from "react"
import { toast } from "sonner"
import { saveCalificacionMesa } from "@/app/actions/notas-mesas-actions"
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table"

interface CalificacionMesaExistente {
  id: number
  nota: number | null
  ausente: boolean
  libro: string | null
  folio: string | null
}

// Celdas editables (nota + libro/folio) de la fila de un alumno inscripto a
// una mesa. Guarda al perder foco si algo cambió: POST si todavía no hay
// calificación, PUT si ya existe.
export default function CeldasNotaMesa({
  mesaExamenId,
  alumnoUserId,
  calificacion,
}: {
  mesaExamenId: number
  alumnoUserId: number
  calificacion: CalificacionMesaExistente | null
}) {
  const [nota, setNota] = useState(calificacion?.nota?.toString() ?? "")
  const [libro, setLibro] = useState(calificacion?.libro ?? "")
  const [folio, setFolio] = useState(calificacion?.folio ?? "")
  const [isSaving, setIsSaving] = useState(false)

  async function guardarSiCambio() {
    const notaActual = calificacion?.nota?.toString() ?? ""
    const libroActual = calificacion?.libro ?? ""
    const folioActual = calificacion?.folio ?? ""
    if (nota === notaActual && libro === libroActual && folio === folioActual) return

    const notaNumerica = nota === "" ? null : Number(nota)
    if (nota !== "" && Number.isNaN(notaNumerica)) return

    if (calificacion && calificacion.nota !== null && notaNumerica !== calificacion.nota) {
      const confirmado = confirm(
        `Esta nota ya está cargada (${calificacion.nota}). ¿Confirmás que querés sobrescribirla por ${notaNumerica ?? "vacío"}?`
      )
      if (!confirmado) {
        setNota(calificacion.nota.toString())
        return
      }
    }

    setIsSaving(true)
    try {
      await saveCalificacionMesa({
        mesaExamenId,
        alumnoId: alumnoUserId,
        nota: notaNumerica,
        ausente: calificacion?.ausente ?? false,
        libro: libro === "" ? null : libro,
        folio: folio === "" ? null : folio,
        calificacionId: calificacion?.id,
      })
      toast.success("Calificación guardada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la calificación")
    } finally {
      setIsSaving(false)
    }
  }

  function blurConEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur()
  }

  return (
    <>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={10}
          step={0.5}
          className="w-20 text-center"
          value={nota}
          disabled={isSaving}
          onChange={(e) => setNota(e.target.value)}
          onBlur={guardarSiCambio}
          onKeyDown={blurConEnter}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Libro"
            className="w-20"
            value={libro}
            disabled={isSaving}
            onChange={(e) => setLibro(e.target.value)}
            onBlur={guardarSiCambio}
            onKeyDown={blurConEnter}
          />
          <Input
            placeholder="Folio"
            className="w-20"
            value={folio}
            disabled={isSaving}
            onChange={(e) => setFolio(e.target.value)}
            onBlur={guardarSiCambio}
            onKeyDown={blurConEnter}
          />
        </div>
      </TableCell>
    </>
  )
}
