package ar.edu.itec1misiones.exception;

public class PeriodoAcademicoNotFoundException extends RuntimeException {
    public PeriodoAcademicoNotFoundException(Long id) {
        super("Periodo académico no encontrado con id: " + id);
    }
}
