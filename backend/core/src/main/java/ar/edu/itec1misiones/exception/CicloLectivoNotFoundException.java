package ar.edu.itec1misiones.exception;

public class CicloLectivoNotFoundException extends RuntimeException {
    public CicloLectivoNotFoundException(Long id) {
        super("Ciclo lectivo no encontrado con id: " + id);
    }
}
