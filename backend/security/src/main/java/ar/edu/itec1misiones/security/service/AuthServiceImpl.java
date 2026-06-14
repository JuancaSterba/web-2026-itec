package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.dto.request.RegisterUserRequest;
import ar.edu.itec1misiones.security.constants.SecurityConstants;
import ar.edu.itec1misiones.security.exception.UserExistException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.impl.AuthService;
import ar.edu.itec1misiones.service.UsuarioCallback;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtServiceImpl;
    private final UsuarioCallback usuarioCallback;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtServiceImpl jwtServiceImpl,
                           UsuarioCallback usuarioCallback) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtServiceImpl = jwtServiceImpl;
        this.usuarioCallback = usuarioCallback;
    }

    @Override
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(SecurityConstants.MSG_USER_NOT_FOUND));

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new BadCredentialsException(SecurityConstants.MSG_CREDENTIALS_INVALID);

        Map<String, Object> extraClaims = usuarioCallback.obtenerDatosUsuario(user);
        return jwtServiceImpl.generateToken(user, extraClaims);
    }

    @Override
    public UserDetails validateToken(String token) {
        return jwtServiceImpl.validateTokenAndGetUser(token);
    }

}
