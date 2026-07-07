"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createPeriodo(formData: FormData, cicloId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    cicloLectivoId: cicloId,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/periodos-academicos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}

export async function updatePeriodo(formData: FormData, periodoId: number, cicloId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    cicloLectivoId: cicloId,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/periodos-academicos/${periodoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}

export async function deletePeriodo(periodoId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/periodos-academicos/${periodoId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo eliminar el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}
