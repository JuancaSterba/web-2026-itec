package ar.edu.itec1misiones.exception;

public class CupoComisionLlenoException extends RuntimeException {
    public CupoComisionLlenoException(Long comisionId) {
        super("La comisión con id " + comisionId + " no tiene cupo disponible");
    }
}
