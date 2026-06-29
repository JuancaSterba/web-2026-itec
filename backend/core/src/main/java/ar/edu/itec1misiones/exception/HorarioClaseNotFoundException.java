package ar.edu.itec1misiones.exception;

public class HorarioClaseNotFoundException extends RuntimeException {
    public HorarioClaseNotFoundException(Long id) {
        super("Horario de clase no encontrado con id: " + id);
    }
}
