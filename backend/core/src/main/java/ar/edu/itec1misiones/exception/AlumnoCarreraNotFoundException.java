package ar.edu.itec1misiones.exception;

public class AlumnoCarreraNotFoundException extends RuntimeException {
    public AlumnoCarreraNotFoundException(Long id) {
        super("Inscripción a carrera no encontrada con id: " + id);
    }
}
