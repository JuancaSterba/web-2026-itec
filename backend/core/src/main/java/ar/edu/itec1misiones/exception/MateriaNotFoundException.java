package ar.edu.itec1misiones.exception;

public class MateriaNotFoundException extends RuntimeException {
    public MateriaNotFoundException(Long id) {
        super("Materia no encontrada con id: " + id);
    }
}
