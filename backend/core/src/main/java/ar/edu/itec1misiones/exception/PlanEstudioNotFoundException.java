package ar.edu.itec1misiones.exception;

public class PlanEstudioNotFoundException extends RuntimeException {
    public PlanEstudioNotFoundException(Long id) {
        super("Plan de estudio no encontrado con id: " + id);
    }
}
