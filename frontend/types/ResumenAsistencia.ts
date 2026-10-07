// Espejo de ResumenAsistenciaResponse (ms-asistencias): GET /api/v1/asistencias/resumen.
export type EstadoRegularidad = "REGULAR" | "NO_REGULAR" | "SIN_REGISTROS"

export interface ResumenAsistencia {
  cursadaId: number
  presentes: number
  tardanzas: number
  ausentes: number
  totalClases: number
  // null cuando no hay clases con marca (SIN_REGISTROS).
  porcentaje: number | null
  estado: EstadoRegularidad
}
