package ar.edu.itec1misiones.exception;

public class ComisionProfesorNotFoundException extends RuntimeException {
    public ComisionProfesorNotFoundException(Long id) {
        super("Asignación docente no encontrada con id: " + id);
    }
}
