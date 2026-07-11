package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoEnCarreraException extends RuntimeException {
    public AlumnoYaInscriptoEnCarreraException(Long alumnoId, String carreraNombre) {
        super("El alumno con ID " + alumnoId + " ya está inscripto en la carrera '" + carreraNombre + "'");
    }
}
