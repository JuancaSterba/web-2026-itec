package ar.edu.itec1misiones.exception;

public class MateriaPlanNotFoundException extends RuntimeException {
    public MateriaPlanNotFoundException(Long id) {
        super("Materia de plan no encontrada con id: " + id);
    }
}
