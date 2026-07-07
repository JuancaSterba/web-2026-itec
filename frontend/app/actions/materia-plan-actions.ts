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
    throw new Error("No se pudo enlazar la materia al plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]/planes/[planId]", "page")
}
