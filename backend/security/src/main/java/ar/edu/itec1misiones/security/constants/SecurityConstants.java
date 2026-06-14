package ar.edu.itec1misiones.security.constants;

public class SecurityConstants {
    public static final String MSG_CREDENTIALS_INVALID = "Credenciales inválidas";

    // TOKEN
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_PREFIX_REPLACE = "";
    public static final String MSG_TOKEN_VALID = "Token válido para usuario: ";
    public static final String MSG_USER_REGISTER_SUCCESSFUL = "Usuario registrado correctamente";

    public static final String AUTH_BASE_PATH = "/auth";

    public static final String LOGIN_PATH = "/login";
    public static final String VALIDATE_PATH = "/validate";

    public static final String REGISTER_PATH = "/register";

    public static final String MSG_ACCESS_DENIED = "No tiene permisos para crear un usuario con rol ";
    public static final String MSG_USER_EXISTS = "Usuario ya existe";
    public static final String MSG_USER_NOT_FOUND = "Usuario no encontrado";
}
