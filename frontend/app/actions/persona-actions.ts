"use server"

import { fetchApi } from "@/lib/api-server"

export interface PersonaResumen {
  nombre: string
  apellido: string
  email: string
  telefono: string
  legajo: string
  roles: string[]
}

export async function buscarPersonaPorDniAction(dni: string): Promise<PersonaResumen | null> {
  const response = await fetchApi(`/api/v1/personas/dni/${dni}`, {
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error("Error buscando persona")
  }

  const json = await response.json()
  return json?.data?.[0] ?? null
}
