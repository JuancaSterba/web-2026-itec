package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.constants.SecurityConstants;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UsuarioCallback;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtServiceImpl jwtServiceImpl;

    @Mock
    private UsuarioCallback usuarioCallback;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void login_usuarioInexistente_lanzaCredencialesInvalidas() {
        when(userRepository.findByUsername("noexiste")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("noexiste", "secreta"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage(SecurityConstants.MSG_CREDENTIALS_INVALID);
    }

    @Test
    void login_passwordIncorrecta_lanzaElMismoErrorQueUsuarioInexistente() {
        User user = new User();
        user.setPassword("hash");
        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("ana", "mala"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage(SecurityConstants.MSG_CREDENTIALS_INVALID);
        verifyNoInteractions(jwtServiceImpl);
    }
}
