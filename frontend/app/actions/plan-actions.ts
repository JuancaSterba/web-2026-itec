"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createPlan(formData: FormData, carreraId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    cohorte: formData.get("cohorte"),
    resolucion: formData.get("resolucion"),
    fechaImplementacion: formData.get("fechaImplementacion"),
    carreraId,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/planes-estudio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el plan de estudio")
  }

  revalidatePath("/dashboard/carreras/[id]", "page")
}
