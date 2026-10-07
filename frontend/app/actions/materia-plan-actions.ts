"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createMateriaPlan(formData: FormData, planId: number) {
  const payload = {
    planEstudioId: planId,
    materiaId: Number(formData.get("materiaId")),
    cuatrimestreDictado: Number(formData.get("cuatrimestreDictado")),
    cargaHoraria: Number(formData.get("cargaHoraria")),
    correlativaIds: formData.getAll("correlativaIds").map(Number),
    modalidadEvaluacion: formData.get("modalidadEvaluacion"),
  }

  const response = await fetchApi(`/api/v1/materias-plan`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo enlazar la materia al plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}

export async function updateMateriaPlan(formData: FormData, materiaPlanId: number, planId: number) {
  const payload = {
    planEstudioId: planId,
    materiaId: Number(formData.get("materiaId")),
    cuatrimestreDictado: Number(formData.get("cuatrimestreDictado")),
    cargaHoraria: Number(formData.get("cargaHoraria")),
    correlativaIds: formData.getAll("correlativaIds").map(Number),
    modalidadEvaluacion: formData.get("modalidadEvaluacion"),
  }

  const response = await fetchApi(`/api/v1/materias-plan/${materiaPlanId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo actualizar la materia del plan")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}

export async function deleteMateriaPlan(materiaPlanId: number) {
  const response = await fetchApi(`/api/v1/materias-plan/${materiaPlanId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo quitar la materia del plan")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}
