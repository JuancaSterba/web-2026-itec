import apiClient from "@/lib/api-client"

// Coincide con AlumnoResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
// telefonoSecundario si es editable (dato opcional de contacto).
export interface Alumno {
  id: number
  legajo: string
  activo: boolean
  userId: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario: string
}

// POST /api/core/alumnos ahora es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=ALUMNO) y el Alumno en
// la misma transaccion (ver docs/Reglas_de_Negocio.md y AlumnoRegistroDTO).
// El legajo ya no se pide: el Core lo autogenera como AAAA-DNI.
export interface CrearAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario?: string
}

// AlumnoUpdateRequest del Core: legajo NO es editable (vive en el Usuario,
// es identidad de por vida) -- pero nombre/apellido/dni/email si lo son, y
// si el dni cambia el Core recalcula el legajo automaticamente.
export interface ActualizarAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  activo: boolean
  telefonoSecundario?: string
}


