package ar.edu.itec1misiones.security.exception;

public class PerfilNotFoundException extends RuntimeException {
    public PerfilNotFoundException() {
        super("No se encontraron los datos del usuario");
    }
}
