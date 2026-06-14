package ar.edu.itec1misiones.security.service.impl;

import ar.edu.itec1misiones.dto.request.RegisterUserRequest;

public interface UserService {
    void register(RegisterUserRequest request);
}
