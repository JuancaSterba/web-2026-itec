package ar.edu.itec1misiones.exception;

public class CarreraNotFoundException extends RuntimeException {
    public CarreraNotFoundException(Long id) {
        super("Carrera no encontrada con id: " + id);
    }
}
