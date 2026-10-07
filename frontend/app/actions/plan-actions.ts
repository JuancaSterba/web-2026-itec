"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createPlan(formData: FormData, carreraId: number) {
  const payload = {
    cohorte: formData.get("cohorte"),
    resolucion: formData.get("resolucion"),
    fechaImplementacion: formData.get("fechaImplementacion"),
    carreraId,
  }

  const response = await fetchApi(`/api/v1/planes-estudio`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

export async function updatePlan(formData: FormData, planId: number, carreraId: number) {
  const payload = {
    cohorte: formData.get("cohorte"),
    resolucion: formData.get("resolucion"),
    fechaImplementacion: formData.get("fechaImplementacion"),
    carreraId,
  }

  const response = await fetchApi(`/api/v1/planes-estudio/${planId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}

export async function deletePlan(planId: number) {
  const response = await fetchApi(`/api/v1/planes-estudio/${planId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja el plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}
