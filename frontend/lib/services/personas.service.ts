import apiClient from "@/lib/api-client"

// Coincide con PersonaResumenResponse del Core.
export interface PersonaResumen {
  nombre: string
  apellido: string
  email: string
  telefono: string
  legajo: string
  roles: string[]
}

// Devuelve null si el DNI no esta registrado (404) -- no es un error de
// UI, es el caso esperado de "persona nueva" en el formulario de alta.
export async function buscarPersonaPorDni(dni: string): Promise<PersonaResumen | null> {
  try {
    const response = await apiClient.get<PersonaResumen[]>(`/api/core/personas/dni/${dni}`)
    return response.data[0] ?? null
  } catch (err: any) {
    if (err?.status === 404) {
      return null
    }
    throw err
  }
}
