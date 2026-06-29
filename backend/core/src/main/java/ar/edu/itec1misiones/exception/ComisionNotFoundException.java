package ar.edu.itec1misiones.exception;

public class ComisionNotFoundException extends RuntimeException {
    public ComisionNotFoundException(Long id) {
        super("Comisión no encontrada con id: " + id);
    }
}
