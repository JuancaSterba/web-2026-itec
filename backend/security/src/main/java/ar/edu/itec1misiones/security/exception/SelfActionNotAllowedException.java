package ar.edu.itec1misiones.security.exception;

public class SelfActionNotAllowedException extends RuntimeException {
    public SelfActionNotAllowedException(String message) {
        super(message);
    }
}
