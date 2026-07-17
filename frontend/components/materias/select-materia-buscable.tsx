"use client"

import { useState, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { normalizar } from "@/lib/texto"

interface MateriaDisponible {
  id: number
  nombre: string
}

export default function SelectMateriaBuscable({
  id,
  name,
  materias,
  value,
  onValueChange,
  opcionesExtra,
  required,
}: {
  id: string
  name: string
  materias: MateriaDisponible[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  opcionesExtra?: ReactNode
  required?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const termino = normalizar(searchTerm)
  const filtradas = materias.filter((materia) => normalizar(materia.nombre).includes(termino))

  const seleccionada = materias.find((materia) => String(materia.id) === value)
  if (seleccionada && !filtradas.some((materia) => materia.id === seleccionada.id)) {
    filtradas.push(seleccionada)
  }

  const materiasOrdenadas = filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))

  return (
    <div className="space-y-2">
      <Input
        aria-label="Buscar materia"
        placeholder="Buscar materia..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
      />
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-input p-2 mt-2">
        {materiasOrdenadas.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">Sin resultados</p>
        ) : (
          materiasOrdenadas.map((materia) => (
            <label
              key={materia.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="radio"
                name={`radio-${id}`}
                checked={value === String(materia.id)}
                onChange={() => onValueChange(String(materia.id))}
                className="size-4"
              />
              {materia.nombre}
            </label>
          ))
        )}
        {opcionesExtra}
      </div>
      <input type="hidden" id={id} name={name} required={required} value={value} />
    </div>
  )
}
