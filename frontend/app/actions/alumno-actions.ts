"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createAlumno(formData: FormData) {
  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    telefonoSecundario: formData.get("telefonoSecundario"),
  }

  const response = await fetchApi(`/api/v1/alumnos`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear el alumno")
  }

  revalidatePath("/dashboard/alumnos")
  return response.json()
}

export async function updateAlumno(id: number, formData: FormData, activo: boolean) {
  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    activo,
    telefonoSecundario: formData.get("telefonoSecundario"),
  }

  const response = await fetchApi(`/api/v1/alumnos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar el alumno")
  }

  revalidatePath("/dashboard/alumnos")
  revalidatePath(`/dashboard/alumnos/${id}`)
  return response.json()
}

export async function deleteAlumno(id: number) {
  const response = await fetchApi(`/api/v1/alumnos/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo eliminar el alumno")
  }

  revalidatePath("/dashboard/alumnos")
}
