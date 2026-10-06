package ar.edu.itec1misiones.exception;

public class CursadaNotFoundException extends RuntimeException {
    public CursadaNotFoundException(Long id) {
        super("Cursada no encontrada con id: " + id);
    }
}
