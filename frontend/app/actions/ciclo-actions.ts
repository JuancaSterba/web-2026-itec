"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createCiclo(formData: FormData) {
  const payload = {
    anio: Number(formData.get("anio")),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
  }

  const response = await fetchApi(`/api/v1/ciclos-lectivos`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear el ciclo lectivo")
  }

  const json = await response.json()
  const creado = json?.data?.[0]

  revalidatePath("/dashboard/ciclos")
  return { id: creado?.id as number, anio: (creado?.anio ?? payload.anio) as number }
}

export async function updateCiclo(id: number, formData: FormData) {
  const payload = {
    anio: Number(formData.get("anio")),
    fechaInicio: formData.get("fechaInicio"),
    fechaFin: formData.get("fechaFin"),
    activo: formData.get("activo") === "on",
  }

  const response = await fetchApi(`/api/v1/ciclos-lectivos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar el ciclo lectivo")
  }

  revalidatePath("/dashboard/ciclos")
}

export async function deleteCiclo(id: number) {
  const response = await fetchApi(`/api/v1/ciclos-lectivos/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo desactivar el ciclo lectivo")
  }

  revalidatePath("/dashboard/ciclos")
}
