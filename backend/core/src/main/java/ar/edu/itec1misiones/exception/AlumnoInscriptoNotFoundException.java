package ar.edu.itec1misiones.exception;

public class AlumnoInscriptoNotFoundException extends RuntimeException {
    public AlumnoInscriptoNotFoundException(Long id) {
        super("No se encontró la inscripción a materia con id " + id);
    }
}
