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
  placeholder,
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
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {materiasOrdenadas.length === 0 && !placeholder ? (
          <option value="" disabled>
            Sin resultados
          </option>
        ) : (
          materiasOrdenadas.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {materia.nombre}
            </option>
          ))
        )}
        {opcionesExtra}
      </select>
      {materiasOrdenadas.length === 0 && placeholder && (
        <p className="text-sm text-muted-foreground">Sin resultados</p>
      )}
    </div>
  )
}
