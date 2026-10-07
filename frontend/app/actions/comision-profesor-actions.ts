"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createComisionProfesor(formData: FormData, comisionId: number) {
  const payload = {
    comisionId,
    profesorId: Number(formData.get("profesorId")),
    rol: formData.get("rol"),
  }

  const response = await fetchApi(`/api/v1/comisiones-profesores`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo asignar el profesor a la comisión")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function updateComisionProfesor(formData: FormData, comisionProfesorId: number, comisionId: number) {
  const payload = {
    comisionId,
    profesorId: Number(formData.get("profesorId")),
    rol: formData.get("rol"),
  }

  const response = await fetchApi(`/api/v1/comisiones-profesores/${comisionProfesorId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la asignación docente")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function deleteComisionProfesor(comisionProfesorId: number) {
  const response = await fetchApi(`/api/v1/comisiones-profesores/${comisionProfesorId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo quitar la asignación docente")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}
