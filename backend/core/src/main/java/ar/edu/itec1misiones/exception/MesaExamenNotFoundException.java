package ar.edu.itec1misiones.exception;

public class MesaExamenNotFoundException extends RuntimeException {
    public MesaExamenNotFoundException(Long id) {
        super("Mesa de examen no encontrada con id: " + id);
    }
}
