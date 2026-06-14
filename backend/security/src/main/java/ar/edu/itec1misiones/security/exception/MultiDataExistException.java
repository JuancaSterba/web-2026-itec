package ar.edu.itec1misiones.security.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class MultiDataExistException extends RuntimeException {
    private final List<String> errors;

    public MultiDataExistException(List<String> errores) {
        super("Uno o más campos ya están registrados");
        this.errors = errores;
    }
}
