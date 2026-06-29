package ar.edu.itec1misiones.exception;

public class ProfesorNotFoundException extends RuntimeException {
    public ProfesorNotFoundException(Long id) {
        super("Profesor no encontrado con id: " + id);
    }

    public ProfesorNotFoundException(String campo, String valor) {
        super("Profesor no encontrado con " + campo + ": " + valor);
    }
}
