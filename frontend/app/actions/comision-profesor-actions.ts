"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createComisionProfesor(formData: FormData, comisionId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    comisionId,
    profesorId: Number(formData.get("profesorId")),
    rol: formData.get("rol"),
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/comisiones-profesores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo asignar el profesor a la comisión")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}
