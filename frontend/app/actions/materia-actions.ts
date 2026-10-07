"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createMateria(formData: FormData) {
  const payload = {
    nombre: formData.get("nombre"),
    codigoInterno: formData.get("codigoInterno"),
    descripcion: formData.get("descripcion"),
  }

  const response = await fetchApi(`/api/v1/materias`, {
    method: "POST",
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
  const payload = {
    nombre: formData.get("nombre"),
    codigoInterno: formData.get("codigoInterno"),
    descripcion: formData.get("descripcion"),
  }

  const response = await fetchApi(`/api/v1/materias/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la materia")
  }

  revalidatePath("/dashboard/materias")
}

export async function deleteMateria(id: number) {
  const response = await fetchApi(`/api/v1/materias/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la materia")
  }

  revalidatePath("/dashboard/materias")
}
