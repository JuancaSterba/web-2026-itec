package ar.edu.itec1misiones.exception;

public class AlumnoNotFoundException extends RuntimeException {
    public AlumnoNotFoundException(Long id) {
        super("Alumno no encontrado con id: " + id);
    }

    public AlumnoNotFoundException(String campo, String valor) {
        super("Alumno no encontrado con " + campo + ": " + valor);
    }
}
