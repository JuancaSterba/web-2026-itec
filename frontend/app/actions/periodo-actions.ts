"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createPeriodo(formData: FormData, cicloId: number) {
  const payload = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    cicloLectivoId: cicloId,
  }

  const response = await fetchApi(`/api/v1/periodos-academicos`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}

export async function updatePeriodo(formData: FormData, periodoId: number, cicloId: number) {
  const payload = {
    nombre: formData.get("nombre"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    cicloLectivoId: cicloId,
  }

  const response = await fetchApi(`/api/v1/periodos-academicos/${periodoId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}

export async function deletePeriodo(periodoId: number) {
  const response = await fetchApi(`/api/v1/periodos-academicos/${periodoId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo eliminar el período académico")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}
