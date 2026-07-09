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
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear la materia")
  }

  const body = await response.json()
  revalidatePath("/dashboard/materias")
  return body.data[0] as { id: number; nombre: string }
}

export async function updateMateria(id: number, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombre: formData.get("nombre"),
    codigoInterno: formData.get("codigoInterno"),
    descripcion: formData.get("descripcion"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la materia")
  }

  revalidatePath("/dashboard/materias")
}

export async function deleteMateria(id: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la materia")
  }

  revalidatePath("/dashboard/materias")
}
