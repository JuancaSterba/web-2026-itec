package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoEnMateriaException extends RuntimeException {
    public AlumnoYaInscriptoEnMateriaException(Long alumnoCarreraId, Long comisionId) {
        super("El alumnoCarrera con id " + alumnoCarreraId +
              " ya está inscripto en la comisión con id " + comisionId);
    }
}
