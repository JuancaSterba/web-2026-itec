package ar.edu.itec1misiones.security.service.impl;

import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.dto.PerfilResponse;
import ar.edu.itec1misiones.security.exception.PerfilNotFoundException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.PerfilService;
import ar.edu.itec1misiones.security.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PerfilServiceImpl implements PerfilService {

    private final UserRepository userRepository;

    public PerfilServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Solo el usuario de la sesion: el endpoint no recibe ningun id, asi
    // nadie puede pedir el perfil de otro.
    @Override
    public PerfilResponse obtener() {
        User user = userRepository.findByUsername(SecurityUtils.getUsername())
                .orElseThrow(PerfilNotFoundException::new);

        return new PerfilResponse(user.getUsername(), user.getNombre(), user.getApellido(),
                user.getDni(), user.getEmail(), user.getTelefono());
    }
}
