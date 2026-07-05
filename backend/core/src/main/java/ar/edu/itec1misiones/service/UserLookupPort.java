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

    /**
     * Actualiza el DNI de un usuario existente, si cambio, y recalcula su
     * legajo (AAAA-DNI) con el nuevo DNI -- libera el legajo anterior, que
     * quedaba "secuestrado" si el DNI original era un error de carga. No
     * hace nada si nuevoDni es null o igual al DNI actual. Lanza
     * IllegalArgumentException si el nuevo DNI ya esta en uso por otra
     * persona. No persiste -- el caller es responsable de guardar el User
     * (normalmente ya sucede como parte de la transaccion del alta/edicion
     * de Alumno/Profesor/Administrador).
     */
    void actualizarDniSiCambio(User user, String nuevoDni);

    /**
     * Actualiza el email de un usuario existente, si cambio. No hace nada
     * si nuevoEmail es null o igual al email actual. Lanza
     * IllegalArgumentException si el nuevo email ya esta en uso por otra
     * persona. No persiste -- mismo criterio que actualizarDniSiCambio.
     */
    void actualizarEmailSiCambio(User user, String nuevoEmail);
}
