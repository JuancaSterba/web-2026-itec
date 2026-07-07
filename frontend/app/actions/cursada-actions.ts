"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createCursada(formData: FormData, comisionId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    alumnoId: Number(formData.get("alumnoId")),
    comisionId,
    fechaInscripcion: new Date().toISOString().slice(0, 10),
    condicionFinal: "REGULAR",
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/cursadas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo matricular al alumno")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function updateCursada(formData: FormData, cursadaId: number, alumnoId: number, comisionId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const notaCierreRaw = formData.get("notaCierre")

  const payload = {
    alumnoId,
    comisionId,
    condicionFinal: formData.get("condicionFinal"),
    notaCierre: notaCierreRaw ? Number(notaCierreRaw) : null,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/cursadas/${cursadaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la cursada")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function deleteCursada(cursadaId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/cursadas/${cursadaId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la cursada")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}
