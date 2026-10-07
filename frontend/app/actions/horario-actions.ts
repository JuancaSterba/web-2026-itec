"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createHorarioClase(comisionId: number, diaSemana: string, horaInicio: string, horaFin: string) {
  const response = await fetchApi(`/api/v1/horarios`, {
    method: "POST",
    body: JSON.stringify({ comisionId, diaSemana, horaInicio, horaFin }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo crear el horario de clase")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}

export async function deleteHorarioClase(id: number) {
  const response = await fetchApi(`/api/v1/horarios/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.errors?.[0]?.description ?? "No se pudo eliminar el horario de clase")
  }

  revalidatePath("/dashboard/comisiones/[comisionId]", "page")
}
