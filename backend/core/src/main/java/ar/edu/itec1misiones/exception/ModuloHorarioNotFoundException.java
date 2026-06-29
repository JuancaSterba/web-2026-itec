package ar.edu.itec1misiones.exception;

public class ModuloHorarioNotFoundException extends RuntimeException {
    public ModuloHorarioNotFoundException(Long id) {
        super("Módulo horario no encontrado con id: " + id);
    }
}
