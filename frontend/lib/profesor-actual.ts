// lib/profesor-actual.ts
// Resuelve el Profesor (id, nombre, apellido) correspondiente al usuario
// logueado, cruzando el DNI del JWT contra GET /profesores/dni/{dni}.
import { getUsuarioActual } from "@/lib/auth-server"
import { fetchCore } from "@/lib/api-server"

interface ProfesorResponse {
  id: number
  nombre: string
  apellido: string
  dni: string
}

export interface ProfesorActual {
  id: number
  nombre: string
  apellido: string
}

export async function getProfesorActual(): Promise<ProfesorActual | null> {
  const usuario = await getUsuarioActual()
  if (!usuario?.dni) return null

  const profesores = await fetchCore<ProfesorResponse>(`/profesores/dni/${usuario.dni}`)
  const profesor = profesores?.[0]
  if (!profesor) return null

  return { id: profesor.id, nombre: profesor.nombre, apellido: profesor.apellido }
}
