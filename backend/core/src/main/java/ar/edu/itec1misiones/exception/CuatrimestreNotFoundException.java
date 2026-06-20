package ar.edu.itec1misiones.exception;

public class CuatrimestreNotFoundException extends RuntimeException {
    public CuatrimestreNotFoundException(Long id) {
        super("Cuatrimestre no encontrado con id: " + id);
    }

    public CuatrimestreNotFoundException(String mensaje) {
        super(mensaje);
    }
}
