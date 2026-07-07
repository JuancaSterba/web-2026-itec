"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

export async function createComision(formData: FormData, periodoId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombreComision: formData.get("nombreComision"),
    cupoMaximo: Number(formData.get("cupoMaximo")),
    materiaPlanId: Number(formData.get("materiaPlanId")),
    periodoAcademicoId: periodoId,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/comisiones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear la comisión")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/periodos/[periodoId]/comisiones", "page")
}

export async function updateComision(formData: FormData, comisionId: number, periodoId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const payload = {
    nombreComision: formData.get("nombreComision"),
    cupoMaximo: Number(formData.get("cupoMaximo")),
    materiaPlanId: Number(formData.get("materiaPlanId")),
    periodoAcademicoId: periodoId,
  }

  const response = await fetch(`${getApiBaseUrl()}/api/core/comisiones/${comisionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la comisión")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/periodos/[periodoId]/comisiones", "page")
}

export async function deleteComision(comisionId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  const response = await fetch(`${getApiBaseUrl()}/api/core/comisiones/${comisionId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo desactivar la comisión")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/periodos/[periodoId]/comisiones", "page")
}
