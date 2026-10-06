package ar.edu.itec1misiones.security.exception;

import java.util.List;

public class AdministradorDatosDuplicadosException extends RuntimeException {

    private final List<String> errores;

    public AdministradorDatosDuplicadosException(List<String> errores) {
        super(String.join(". ", errores));
        this.errores = errores;
    }

    public List<String> getErrores() {
        return errores;
    }
}
