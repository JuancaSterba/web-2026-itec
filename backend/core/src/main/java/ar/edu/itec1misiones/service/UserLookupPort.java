package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;

import java.util.Optional;

public interface UserLookupPort {
    Optional<User> findById(Long id);

    /**
     * Resumen de una persona ya existente por DNI (cualquiera sea su rol),
     * para que el frontend detecte "esta persona ya existe" antes de dar de
     * alta un rol nuevo. Vacio si el DNI no esta registrado.
     */
    Optional<PersonaResumenResponse> buscarPorDni(String dni);

    /**
     * Crea un Usuario con credenciales autogeneradas a partir del DNI
     * (username=DNI, password=DNI encriptada con BCrypt) y el rol indicado.
     * Usado para el alta de un solo paso de Alumnos/Profesores. Lanza
     * IllegalArgumentException si username/DNI/email ya estan en uso (o si
     * telefono ya esta en uso, salvo que el rol sea ALUMNO -- varios alumnos
     * de una misma familia pueden compartir telefono del hogar).
     */
    User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                     String telefono, String telefonoSecundario, Rol rol);

    /**
     * Deshabilita el login del Usuario (enabled=false). Usado cuando se da
     * de baja un Alumno/Profesor, para que la baja tambien revoque acceso
     * si esa cuenta llegara a estar habilitada.
     */
    void deshabilitar(Long userId);
}
