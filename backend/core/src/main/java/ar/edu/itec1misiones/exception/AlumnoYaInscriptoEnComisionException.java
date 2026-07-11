package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoEnComisionException extends RuntimeException {
    public AlumnoYaInscriptoEnComisionException(Long alumnoId, Long comisionId) {
        super("El alumno con ID " + alumnoId + " ya se encuentra inscripto en la comisión " + comisionId);
    }
}
