"use server"

import { cookies } from "next/headers"

export interface PersonaResumen {
  nombre: string
  apellido: string
  email: string
  telefono: string
  legajo: string
  roles: string[]
}

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function buscarPersonaPorDniAction(dni: string): Promise<PersonaResumen | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/personas/dni/${dni}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error("Error buscando persona")
  }

  const json = await response.json()
  return json?.data?.[0] ?? null
}
