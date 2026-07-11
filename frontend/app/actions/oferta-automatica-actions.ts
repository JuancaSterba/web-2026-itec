"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { fetchCore } from "@/lib/api-server"

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

interface PlanEstudioResponse {
  id: number
  carreraId: number
  activo: boolean
}

interface CarreraResponse {
  id: number
  cupoActual: number | null
}

interface MateriaPlanResponse {
  id: number
  planEstudioId: number
  materiaNombre: string
  cuatrimestreDictado: number
}

interface PeriodoAcademicoResponse {
  id: number
  nombre: string
  cicloLectivoId: number
}

const CUPO_DEFAULT = 30

export async function generarOfertaAcademicaAutomatica(cicloId: number, anio: number, carreraIds: number[]) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  // 1. Crear los 2 períodos institucionales del año (reusando los que ya
  // existan para este ciclo con el mismo nombre, para no duplicarlos).
  const periodosExistentes = (await fetchCore<PeriodoAcademicoResponse>("/periodos-academicos")) ?? []
  const periodosDelCiclo = periodosExistentes.filter((p) => p.cicloLectivoId === cicloId)

  const periodosACrear = [
    { nombre: `1er Cuatrimestre ${anio}`, fechaInicio: `${anio}-03-01`, fechaFin: `${anio}-07-15`, paridad: 1 },
    { nombre: `2do Cuatrimestre ${anio}`, fechaInicio: `${anio}-08-01`, fechaFin: `${anio}-12-15`, paridad: 0 },
  ]

  const periodosCreados = await Promise.all(
    periodosACrear.map(async (periodo) => {
      const existente = periodosDelCiclo.find((p) => p.nombre === periodo.nombre)
      if (existente) {
        return { id: existente.id, paridad: periodo.paridad }
      }
      const response = await fetch(`${getApiBaseUrl()}/api/core/periodos-academicos`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: periodo.nombre,
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin,
          cicloLectivoId: cicloId,
        }),
      })
      if (!response.ok) {
        throw new Error(`No se pudo crear el período "${periodo.nombre}"`)
      }
      const json = await response.json()
      return { id: json?.data?.[0]?.id as number, paridad: periodo.paridad }
    })
  )

  const periodoIdParaImpar = periodosCreados.find((p) => p.paridad === 1)?.id
  const periodoIdParaPar = periodosCreados.find((p) => p.paridad === 0)?.id

  // 2. Por cada carrera elegida, crear 1 Comisión por materia de su plan
  // activo: cuatrimestre curricular impar -> 1er período, par -> 2do período.
  const [planesEstudio, materiasPlan, carreras] = await Promise.all([
    fetchCore<PlanEstudioResponse>("/planes-estudio"),
    fetchCore<MateriaPlanResponse>("/materias-plan"),
    fetchCore<CarreraResponse>("/carreras"),
  ])
  const cupoPorCarreraId = new Map((carreras ?? []).map((c) => [c.id, c.cupoActual]))

  const comisionesACrear: { nombreComision: string; materiaPlanId: number; periodoAcademicoId: number; cupoMaximo: number }[] = []

  for (const carreraId of carreraIds) {
    const plan = (planesEstudio ?? []).find((p) => p.carreraId === carreraId && p.activo)
    if (!plan) continue

    const cupoMaximo = cupoPorCarreraId.get(carreraId) ?? CUPO_DEFAULT
    const materiasDelPlan = (materiasPlan ?? []).filter((mp) => mp.planEstudioId === plan.id)
    for (const mp of materiasDelPlan) {
      const esImpar = mp.cuatrimestreDictado % 2 !== 0
      const periodoAcademicoId = esImpar ? periodoIdParaImpar : periodoIdParaPar
      if (!periodoAcademicoId) continue
      comisionesACrear.push({ nombreComision: mp.materiaNombre, materiaPlanId: mp.id, periodoAcademicoId, cupoMaximo })
    }
  }

  const respuestas = await Promise.all(
    comisionesACrear.map((item) =>
      fetch(`${getApiBaseUrl()}/api/core/comisiones`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombreComision: item.nombreComision,
          cupoMaximo: item.cupoMaximo,
          materiaPlanId: item.materiaPlanId,
          periodoAcademicoId: item.periodoAcademicoId,
        }),
      })
    )
  )

  if (respuestas.some((response) => !response.ok)) {
    throw new Error("Se crearon los períodos, pero no se pudieron generar todas las comisiones")
  }

  revalidatePath("/dashboard/ciclos/[cicloId]", "page")
}
