package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;

import java.util.Optional;

public interface UserLookupPort {
    Optional<User> findById(Long id);

    /**
     * Crea un Usuario con credenciales autogeneradas a partir del DNI
     * (username=DNI, password=DNI encriptada con BCrypt) y el rol indicado.
     * Usado para el alta de un solo paso de Alumnos/Profesores. Lanza
     * IllegalArgumentException si username/DNI/email/telefono ya estan en uso.
     */
    User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email, String telefono, Rol rol);
}
