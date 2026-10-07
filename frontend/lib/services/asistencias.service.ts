export type EstadoAsistencia = "PRESENTE" | "AUSENTE" | "TARDE"

// ms-asistencias es un microservicio aislado: solo conoce alumnoId (numero),
// nunca el nombre del alumno -- ese cruce lo hace el frontend con los datos
// del Core (ver app/dashboard/asistencias/page.tsx).
export interface Asistencia {
  id: number
  alumnoId: number
  comisionId: number
  fecha: string // YYYY-MM-DD
  estado: EstadoAsistencia
}

export interface AsistenciaInput {
  alumnoId: number
  comisionId: number
  fecha: string
  estado: EstadoAsistencia
}
