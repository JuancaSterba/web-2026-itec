"use server"

import { fetchApi } from "@/lib/api-server"
import { revalidatePath } from "next/cache"

export async function createComisionesMasivas(
  periodoId: number,
  seleccion: { materiaPlanId: number; nombreComision: string }[],
  cupoMaximo: number
) {
  const respuestas = await Promise.all(
    seleccion.map((item) =>
      fetchApi(`/api/v1/comisiones`, {
        method: "POST",
        body: JSON.stringify({
          nombreComision: item.nombreComision,
          cupoMaximo,
          materiaPlanId: item.materiaPlanId,
          periodoAcademicoId: periodoId,
        }),
      })
    )
  )

  if (respuestas.some((response) => !response.ok)) {
    throw new Error("No se pudieron crear todas las comisiones seleccionadas")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/carreras/[carreraId]/periodos/[periodoId]/comisiones", "page")
}

export async function updateComision(formData: FormData, comisionId: number, periodoId: number) {
  const payload = {
    nombreComision: formData.get("nombreComision"),
    cupoMaximo: Number(formData.get("cupoMaximo")),
    materiaPlanId: Number(formData.get("materiaPlanId")),
    periodoAcademicoId: periodoId,
  }

  const response = await fetchApi(`/api/v1/comisiones/${comisionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("No se pudo actualizar la comisión")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/carreras/[carreraId]/periodos/[periodoId]/comisiones", "page")
}

export async function deleteComision(comisionId: number) {
  const response = await fetchApi(`/api/v1/comisiones/${comisionId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("No se pudo desactivar la comisión")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]/carreras/[carreraId]/periodos/[periodoId]/comisiones", "page")
}
