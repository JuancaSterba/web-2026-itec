package ar.edu.itec1misiones.exception;

public class PersonaNotFoundException extends RuntimeException {
    public PersonaNotFoundException(String dni) {
        super("No existe ninguna persona registrada con DNI: " + dni);
    }
}
