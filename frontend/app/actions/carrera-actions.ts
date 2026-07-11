"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createCarrera(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const cupoActual = formData.get("cupoActual")
  const payload = {
    nombre: formData.get("nombre"),
    resolucionMinisterial: formData.get("resolucionMinisterial"),
    cupoActual: cupoActual ? Number(cupoActual) : null,
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

export async function updateCarrera(id: number, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const cupoActual = formData.get("cupoActual")
  const payload = {
    nombre: formData.get("nombre"),
    resolucionMinisterial: formData.get("resolucionMinisterial"),
    cupoActual: cupoActual ? Number(cupoActual) : null,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/carreras/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la carrera")
  }

  revalidatePath("/dashboard/carreras")
}

export async function deleteCarrera(id: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/carreras/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la carrera")
  }

  revalidatePath("/dashboard/carreras")
}
