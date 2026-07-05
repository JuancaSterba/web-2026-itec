package ar.edu.itec1misiones.exception;

import ar.edu.itec1misiones.model.Rol;

public class RolYaAsignadoException extends RuntimeException {
    public RolYaAsignadoException(String dni, Rol rol) {
        super("La persona con DNI '" + dni + "' ya tiene el rol " + rol);
    }
}
