"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createMateria(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombre: formData.get("nombre"),
    codigoInterno: formData.get("codigoInterno"),
    descripcion: formData.get("descripcion"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear la materia")
  }

  revalidatePath("/dashboard/materias")
}
