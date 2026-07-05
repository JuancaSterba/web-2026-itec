package ar.edu.itec1misiones.security.service.impl;

import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.exception.AdministradorDatosDuplicadosException;
import ar.edu.itec1misiones.security.exception.AdministradorNotFoundException;
import ar.edu.itec1misiones.security.exception.RolNoGestionableException;
import ar.edu.itec1misiones.security.exception.SelfActionNotAllowedException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.UserAdminService;
import ar.edu.itec1misiones.security.util.SecurityUtils;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserAdminServiceImpl implements UserAdminService {

    private static final List<Rol> ROLES_GESTIONABLES = List.of(Rol.ADMIN, Rol.ADMINISTRATIVO);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserLookupPort userLookupPort;

    public UserAdminServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                 UserLookupPort userLookupPort) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userLookupPort = userLookupPort;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listar() {
        return userRepository.findByRolesIn(ROLES_GESTIONABLES).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioAdminResponse crear(CrearAdministradorRequest request) {
        validarRolGestionable(request.getRol());

        User user = userLookupPort.crearConCredencialesPorDni(
                request.getNombre(), request.getApellido(), request.getDni(), request.getEmail(),
                request.getTelefono(), null, request.getRol());

        return toResponse(user);
    }

    @Override
    public UsuarioAdminResponse actualizar(Long id, ActualizarAdministradorRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AdministradorNotFoundException(id));

        if (user.getRoles().stream().noneMatch(ROLES_GESTIONABLES::contains)) {
            throw new AdministradorNotFoundException(id);
        }

        validarRolGestionable(request.getRol());

        boolean esUsuarioActual = user.getUsername().equals(SecurityUtils.getUsername());
        boolean cambiaRol = !user.getRoles().contains(request.getRol());
        boolean seDeshabilita = !request.isEnabled();

        if (esUsuarioActual && (cambiaRol || seDeshabilita)) {
            throw new SelfActionNotAllowedException("No podés deshabilitarte o cambiar tu propio rol");
        }

        List<String> errores = new ArrayList<>();
        if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            errores.add("El email '" + request.getEmail() + "' ya está en uso");
        }
        if (!errores.isEmpty()) {
            throw new AdministradorDatosDuplicadosException(errores);
        }

        Set<Rol> nuevosRoles = new HashSet<>(user.getRoles());
        nuevosRoles.removeAll(ROLES_GESTIONABLES);
        nuevosRoles.add(request.getRol());

        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());
        user.setRoles(nuevosRoles);
        user.setEnabled(request.isEnabled());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UsuarioAdminResponse resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AdministradorNotFoundException(id));

        if (user.getRoles().stream().noneMatch(ROLES_GESTIONABLES::contains)) {
            throw new AdministradorNotFoundException(id);
        }

        user.setPassword(passwordEncoder.encode(user.getDni()));

        return toResponse(userRepository.save(user));
    }

    private void validarRolGestionable(Rol rol) {
        if (!ROLES_GESTIONABLES.contains(rol)) {
            throw new RolNoGestionableException("Rol no gestionable desde este módulo: " + rol);
        }
    }

    private UsuarioAdminResponse toResponse(User user) {
        Rol rolPrincipal = user.getRoles().stream()
                .filter(ROLES_GESTIONABLES::contains)
                .findFirst()
                .orElse(null);

        return UsuarioAdminResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .legajo(user.getLegajo())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .rol(rolPrincipal)
                .enabled(user.isEnabled())
                .build();
    }
}
