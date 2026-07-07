package ar.edu.itec1misiones.exception;

public class InscripcionCarreraNotFoundException extends RuntimeException {
    public InscripcionCarreraNotFoundException(Long id) {
        super("Inscripción a carrera no encontrada con id: " + id);
    }
}
