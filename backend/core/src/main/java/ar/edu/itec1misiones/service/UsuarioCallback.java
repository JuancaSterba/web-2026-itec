package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.RegisterUserRequest;
import ar.edu.itec1misiones.model.User;

import java.util.Map;

public interface UsuarioCallback {
    void crearEntidadAcademica(RegisterUserRequest request, User user);

    Map<String, Object> obtenerDatosUsuario(User user);
}
