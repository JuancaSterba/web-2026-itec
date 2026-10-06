package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoEnMesaException extends RuntimeException {
    public AlumnoYaInscriptoEnMesaException(Long alumnoId, Long mesaExamenId) {
        super("El alumno con ID " + alumnoId + " ya se encuentra inscripto en la mesa de examen " + mesaExamenId);
    }
}
