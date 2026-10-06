package ar.edu.itec1misiones.security.exception;

public class AdministradorNotFoundException extends RuntimeException {
    public AdministradorNotFoundException(Long id) {
        super("No se encontró un administrador con id " + id);
    }
}
