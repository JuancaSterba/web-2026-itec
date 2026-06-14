package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.RegisterUserRequest;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.service.AlumnoService;
import ar.edu.itec1misiones.service.ProfesorService;
import ar.edu.itec1misiones.service.UsuarioCallback;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class UsuarioCallbackImpl implements UsuarioCallback {

    private final AlumnoService alumnoService;
    private final ProfesorService profesorService;

    public UsuarioCallbackImpl(AlumnoService alumnoService, ProfesorService profesorService) {
        this.alumnoService = alumnoService;
        this.profesorService = profesorService;
    }

    @Override
    public void crearEntidadAcademica(RegisterUserRequest request, User user) {
        for (Rol rol : request.getRoles()) {
            switch (rol) {
                case ALUMNO -> alumnoService.crearAlumnoConUsuario(user);
                case PROFESOR -> profesorService.crearProfesorConUsuario(user);
            }
        }
    }

    @Override
    public Map<String, Object> obtenerDatosUsuario(User user) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("username", user.getUsername());
        claims.put("roles", user.getRoles().stream().map(Rol::name).toList());

        Map<String, Object> datos = new HashMap<>();
        datos.put("nombre", user.getNombre());
        datos.put("apellido", user.getApellido());
        datos.put("dni", user.getDni());
        datos.put("email", user.getEmail());
        datos.put("telefono", user.getTelefono());

        claims.put("datos_personales", datos);

        return claims;
    }
}
