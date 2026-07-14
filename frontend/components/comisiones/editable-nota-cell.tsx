"use client"

import { useEffect, useState } from "react"
import { saveCalificacion } from "@/app/actions/nota-actions"
import { Input } from "@/components/ui/input"

export default function EditableNotaCell({
  cursadaId,
  comisionId,
  instancia,
  initialNota,
  calificacionId,
}: {
  cursadaId: number
  comisionId: number
  instancia: string
  initialNota: number | null
  calificacionId?: number
}) {
  const [value, setValue] = useState(initialNota?.toString() ?? "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(initialNota?.toString() ?? "")
  }, [initialNota])

  async function guardarSiCambio() {
    const nota = Number(value)
    if (value === "" || Number.isNaN(nota) || nota === initialNota) return

    if (calificacionId && initialNota !== null) {
      const confirmado = confirm(
        `Esta nota ya está cargada (${initialNota}). ¿Confirmás que querés sobrescribirla por ${nota}?`
      )
      if (!confirmado) {
        setValue(initialNota.toString())
        return
      }
    }

    setIsSaving(true)
    try {
      await saveCalificacion(cursadaId, comisionId, instancia, nota, calificacionId)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Input
      type="number"
      min={0}
      max={10}
      step={0.5}
      className="w-20 text-center"
      value={value}
      disabled={isSaving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={guardarSiCambio}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur()
        }
      }}
    />
  )
}
