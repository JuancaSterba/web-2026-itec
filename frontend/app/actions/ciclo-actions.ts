"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createCiclo(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    anio: Number(formData.get("anio")),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/ciclos-lectivos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el ciclo lectivo")
  }

  revalidatePath("/dashboard/ciclos")
}

export async function updateCiclo(id: number, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    anio: Number(formData.get("anio")),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/ciclos-lectivos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el ciclo lectivo")
  }

  revalidatePath("/dashboard/ciclos")
}

export async function deleteCiclo(id: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/ciclos-lectivos/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo desactivar el ciclo lectivo")
  }

  revalidatePath("/dashboard/ciclos")
}
