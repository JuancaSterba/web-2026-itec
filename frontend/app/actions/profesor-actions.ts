"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createProfesor(formData: FormData) {
  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    titulo: formData.get("titulo"),
    telefonoSecundario: formData.get("telefonoSecundario"),
  }

  const response = await fetchApi(`/api/v1/profesores`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear el profesor")
  }

  revalidatePath("/dashboard/profesores")
  return response.json()
}

export async function updateProfesor(id: number, formData: FormData, activo: boolean) {
  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    titulo: formData.get("titulo"),
    telefonoSecundario: formData.get("telefonoSecundario"),
    activo,
  }

  const response = await fetchApi(`/api/v1/profesores/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar el profesor")
  }

  revalidatePath("/dashboard/profesores")
  revalidatePath(`/dashboard/profesores/${id}`)
  return response.json()
}

export async function deleteProfesor(id: number) {
  const response = await fetchApi(`/api/v1/profesores/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo eliminar el profesor")
  }

  revalidatePath("/dashboard/profesores")
}
