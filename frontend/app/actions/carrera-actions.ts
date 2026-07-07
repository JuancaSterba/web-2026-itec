"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createCarrera(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombre: formData.get("nombre"),
    resolucionMinisterial: formData.get("resolucionMinisterial"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/carreras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear la carrera")
  }

  revalidatePath("/dashboard/carreras")
}
