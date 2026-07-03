package ar.edu.itec1misiones.exception;

public class ComisionInactivaException extends RuntimeException {
    public ComisionInactivaException(Long comisionId) {
        super("La comisión con id " + comisionId + " no está activa");
    }
}
