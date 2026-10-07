package ar.edu.itec1misiones.security.service.impl;

import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.dto.PerfilResponse;
import ar.edu.itec1misiones.security.exception.PerfilNotFoundException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PerfilServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PerfilServiceImpl service;

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    private void autenticarComo(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of()));
    }

    @Test
    void obtener_devuelveDatosVigentesDelUsuarioAutenticado() {
        autenticarComo("40111222");
        User user = new User();
        user.setUsername("40111222");
        user.setNombre("Juan");
        user.setApellido("Pérez");
        user.setDni("40111222");
        user.setEmail("juan.nuevo@itec.edu.ar");
        user.setTelefono("3764111222");
        when(userRepository.findByUsername("40111222")).thenReturn(Optional.of(user));

        PerfilResponse perfil = service.obtener();

        assertThat(perfil.getUsername()).isEqualTo("40111222");
        assertThat(perfil.getNombre()).isEqualTo("Juan");
        assertThat(perfil.getApellido()).isEqualTo("Pérez");
        assertThat(perfil.getDni()).isEqualTo("40111222");
        assertThat(perfil.getEmail()).isEqualTo("juan.nuevo@itec.edu.ar");
        assertThat(perfil.getTelefono()).isEqualTo("3764111222");
    }

    @Test
    void obtener_soloConsultaAlUsuarioDeLaSesion() {
        autenticarComo("40111222");
        User user = new User();
        user.setUsername("40111222");
        when(userRepository.findByUsername("40111222")).thenReturn(Optional.of(user));

        service.obtener();

        verify(userRepository).findByUsername("40111222");
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void obtener_usuarioInexistente_lanzaPerfilNotFound() {
        autenticarComo("borrado");
        when(userRepository.findByUsername("borrado")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtener())
                .isInstanceOf(PerfilNotFoundException.class);
    }
}
