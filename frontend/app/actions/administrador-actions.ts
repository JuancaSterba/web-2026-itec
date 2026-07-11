"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createAdministrador(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const roles = formData.getAll("roles") as string[]

  const payload = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    dni: formData.get("dni"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    roles: roles.length > 0 ? roles : ["ADMINISTRATIVO"],
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/administradores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

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

  const response = await fetch(`${getApiBaseUrl()}/api/core/administradores/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/administradores/${id}/reset-password`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo resetear la contraseña")
  }

  revalidatePath("/dashboard/administradores")
}
