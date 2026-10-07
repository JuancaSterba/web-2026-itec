"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createCarrera(formData: FormData) {
  const cupoActual = formData.get("cupoActual")
  const payload = {
    nombre: formData.get("nombre"),
    resolucionMinisterial: formData.get("resolucionMinisterial"),
    cupoActual: cupoActual ? Number(cupoActual) : null,
  }

  const response = await fetchApi(`/api/v1/carreras`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo crear la carrera")
  }

  revalidatePath("/dashboard/carreras")
}

export async function updateCarrera(id: number, formData: FormData) {
  const cupoActual = formData.get("cupoActual")
  const payload = {
    nombre: formData.get("nombre"),
    resolucionMinisterial: formData.get("resolucionMinisterial"),
    cupoActual: cupoActual ? Number(cupoActual) : null,
  }

  const response = await fetchApi(`/api/v1/carreras/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la carrera")
  }

  revalidatePath("/dashboard/carreras")
}

export async function deleteCarrera(id: number) {
  const response = await fetchApi(`/api/v1/carreras/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo dar de baja la carrera")
  }

  revalidatePath("/dashboard/carreras")
}
