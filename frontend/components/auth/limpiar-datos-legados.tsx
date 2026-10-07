"use client"

import { useEffect } from "react"

// Claves que guardaba la version anterior del login (token, datos personales,
// roles y rol activo). Solo estas: el tema visual tambien vive en localStorage.
const CLAVES_LEGADAS = [
  "token",
  "user-role",
  "username",
  "nombres",
  "apellido",
  "dni",
  "email",
  "telefono",
  "roles",
  "pending-roles",
]

// RF-19: borra lo que dejo la version anterior en este navegador.
export function LimpiarDatosLegados() {
  useEffect(() => {
    try {
      CLAVES_LEGADAS.forEach((clave) => localStorage.removeItem(clave))
    } catch {
      // Sin acceso al almacenamiento (modo privado o bloqueado): no hay nada que borrar.
    }
  }, [])

  return null
}
