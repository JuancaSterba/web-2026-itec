'use client'

import { useEffect, useState } from 'react'

export default function PerfilPage() {
  const [usuario, setUsuario] = useState({
    nombres: '',
    apellido: '',
    dni: '',
    username: '',
    email: '',
    telefono: '',
    roles: [] as string[],
    rolSeleccionado: '',
  })

  useEffect(() => {
    const rolesGuardados = localStorage.getItem('roles')
    const roles = rolesGuardados ? JSON.parse(rolesGuardados) : []

    setUsuario({
      nombres: localStorage.getItem('nombres') || 'Desconocido',
      apellido: localStorage.getItem('apellido') || 'Desconocido',
      dni: localStorage.getItem('dni') || 'Desconocido',
      username: localStorage.getItem('username') || 'Desconocido',
      email: localStorage.getItem('email') || 'Desconocido',
      telefono: localStorage.getItem('telefono') || 'Desconocido',
      roles: Array.isArray(roles) ? roles : [],
      rolSeleccionado: localStorage.getItem('user-role') || 'Sin rol',
    })
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>
      <div className="bg-white p-4 rounded-lg shadow max-w-md">
        <p className="mb-2"><strong>Nombres:</strong> {usuario.nombres}</p>
        <p className="mb-2"><strong>Apellido:</strong> {usuario.apellido}</p>
        <p className="mb-2"><strong>DNI:</strong> {usuario.dni}</p>
        <p className="mb-2"><strong>Usuario:</strong> {usuario.username}</p>
        <p className="mb-2"><strong>Email:</strong> {usuario.email}</p>
        <p className="mb-2"><strong>Teléfono:</strong> {usuario.telefono}</p>
        <p className="mb-2"><strong>Rol seleccionado:</strong> {usuario.rolSeleccionado}</p>
        <div className="mb-2">
          <strong>Roles disponibles:</strong>
          <ul className="list-disc list-inside">
            {usuario.roles.length > 0 ? (
              usuario.roles.map((rol, idx) => <li key={idx}>{rol}</li>)
            ) : (
              <li>No se encontraron roles</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
