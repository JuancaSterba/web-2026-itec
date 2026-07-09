"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createMateriaPlan(formData: FormData, planId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    planEstudioId: planId,
    materiaId: Number(formData.get("materiaId")),
    cuatrimestreDictado: Number(formData.get("cuatrimestreDictado")),
    cargaHoraria: Number(formData.get("cargaHoraria")),
    correlativaIds: formData.getAll("correlativaIds").map(Number),
    modalidadEvaluacion: formData.get("modalidadEvaluacion"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo enlazar la materia al plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}

export async function updateMateriaPlan(formData: FormData, materiaPlanId: number, planId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    planEstudioId: planId,
    materiaId: Number(formData.get("materiaId")),
    cuatrimestreDictado: Number(formData.get("cuatrimestreDictado")),
    cargaHoraria: Number(formData.get("cargaHoraria")),
    correlativaIds: formData.getAll("correlativaIds").map(Number),
    modalidadEvaluacion: formData.get("modalidadEvaluacion"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias-plan/${materiaPlanId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar la materia del plan")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}

export async function deleteMateriaPlan(materiaPlanId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/materias-plan/${materiaPlanId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo quitar la materia del plan")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}
