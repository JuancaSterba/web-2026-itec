package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoException extends RuntimeException {
    public AlumnoYaInscriptoException(Long alumnoId, Long carreraId) {
        super("El alumno con id " + alumnoId + " ya está inscripto en la carrera con id " + carreraId);
    }
}
