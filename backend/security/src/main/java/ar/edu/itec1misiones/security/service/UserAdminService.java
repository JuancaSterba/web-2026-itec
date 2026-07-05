package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;

import java.util.List;

public interface UserAdminService {
    List<UsuarioAdminResponse> listar();
    UsuarioAdminResponse crear(CrearAdministradorRequest request);
    UsuarioAdminResponse actualizar(Long id, ActualizarAdministradorRequest request);
    UsuarioAdminResponse resetPassword(Long id);
}
