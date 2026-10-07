"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createAdministrador(formData: FormData) {
  const roles = formData.getAll("roles") as string[]

  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    roles: roles.length > 0 ? roles : ["ADMINISTRATIVO"],
  }

  const response = await fetchApi(`/api/v1/administradores`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear el administrador")
  }

  revalidatePath("/dashboard/administradores")
  return response.json()
}

export async function updateAdministrador(id: number, formData: FormData, enabled: boolean) {
  const roles = formData.getAll("roles") as string[]

  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    roles: roles.length > 0 ? roles : ["ADMINISTRATIVO"],
    enabled,
  }

  const response = await fetchApi(`/api/v1/administradores/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar el administrador")
  }

  revalidatePath("/dashboard/administradores")
  return response.json()
}

export async function resetPasswordAdministrador(id: number) {
  const response = await fetchApi(`/api/v1/administradores/${id}/reset-password`, {
    method: "POST",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo resetear la contraseña")
  }

  revalidatePath("/dashboard/administradores")
}
