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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAdminServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserAdminServiceImpl service;

    @AfterEach
    void limpiarContextoSeguridad() {
        SecurityContextHolder.clearContext();
    }

    private void autenticarComo(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of()));
    }

    private User buildUser(Long id, String username, Rol rol, boolean enabled) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setNombre("Ana");
        user.setApellido("Gómez");
        user.setDni(username);
        user.setEmail(username + "@itec.edu.ar");
        user.setTelefono("3760000000");
        user.setRoles(Set.of(rol));
        user.setEnabled(enabled);
        return user;
    }

    private CrearAdministradorRequest buildCrearRequest(Rol rol) {
        CrearAdministradorRequest req = new CrearAdministradorRequest();
        req.setNombre("Ana");
        req.setApellido("Gómez");
        req.setDni("30111222");
        req.setEmail("ana@itec.edu.ar");
        req.setTelefono("3760000000");
        req.setRol(rol);
        return req;
    }

    @Test
    void crear_lanzaRolNoGestionableException_siRolNoEsAdminNiAdministrativo() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.PROFESOR);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(RolNoGestionableException.class);

        verifyNoInteractions(userRepository);
    }

    @Test
    void crear_lanzaAdministradorDatosDuplicadosException_siDniYaExiste() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMINISTRATIVO);
        when(userRepository.existsByUsername("30111222")).thenReturn(true);
        when(userRepository.existsByDni("30111222")).thenReturn(true);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(AdministradorDatosDuplicadosException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void crear_creaUsuarioConUsernameYPasswordIgualesAlDni_siDatosValidos() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMIN);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByDni(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("30111222")).thenReturn("HASH_30111222");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UsuarioAdminResponse response = service.crear(request);

        assertThat(response.getUsername()).isEqualTo("30111222");
        assertThat(response.isEnabled()).isTrue();
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);

        verify(userRepository).save(argThat(u ->
                u.getUsername().equals("30111222")
                        && u.getPassword().equals("HASH_30111222")
                        && u.isEnabled()
                        && u.getRoles().equals(Set.of(Rol.ADMIN))
        ));
    }

    @Test
    void listar_devuelveSoloUsuariosConRolAdminOAdministrativo() {
        User admin = buildUser(1L, "11111111", Rol.ADMIN, true);
        User administrativo = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findByRolesIn(List.of(Rol.ADMIN, Rol.ADMINISTRATIVO)))
                .thenReturn(List.of(admin, administrativo));

        List<UsuarioAdminResponse> resultado = service.listar();

        assertThat(resultado).hasSize(2);
        assertThat(resultado).extracting(UsuarioAdminResponse::getUsername)
                .containsExactlyInAnyOrder("11111111", "22222222");
    }

    @Test
    void actualizar_lanzaAdministradorNotFoundException_siNoExiste() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        assertThatThrownBy(() -> service.actualizar(99L, request))
                .isInstanceOf(AdministradorNotFoundException.class);
    }

    @Test
    void actualizar_lanzaSelfActionNotAllowedException_siSeDeshabilitaASiMismo() {
        User propio = buildUser(1L, "11111111", Rol.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(propio));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("ana@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMIN);
        request.setEnabled(false);

        assertThatThrownBy(() -> service.actualizar(1L, request))
                .isInstanceOf(SelfActionNotAllowedException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void actualizar_lanzaSelfActionNotAllowedException_siCambiaSuPropioRol() {
        User propio = buildUser(1L, "11111111", Rol.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(propio));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("ana@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMINISTRATIVO);
        request.setEnabled(true);

        assertThatThrownBy(() -> service.actualizar(1L, request))
                .isInstanceOf(SelfActionNotAllowedException.class);
    }

    @Test
    void actualizar_actualizaDatosRolYEstado_siEsOtroUsuario() {
        User otro = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana Actualizada");
        request.setApellido("Gómez");
        request.setEmail("ana2@itec.edu.ar");
        request.setTelefono("3760000001");
        request.setRol(Rol.ADMIN);
        request.setEnabled(false);

        UsuarioAdminResponse response = service.actualizar(2L, request);

        assertThat(response.getNombre()).isEqualTo("Ana Actualizada");
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);
        assertThat(response.isEnabled()).isFalse();
    }

    @Test
    void resetPassword_reencriptaPasswordUsandoElDniActual() {
        User user = buildUser(3L, "33333333", Rol.ADMIN, true);
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("33333333")).thenReturn("HASH_33333333");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.resetPassword(3L);

        verify(userRepository).save(argThat(u -> u.getPassword().equals("HASH_33333333")));
    }

    @Test
    void actualizar_preservaRolesNoGestionables_siElUsuarioTieneRolAdicional() {
        User otro = buildUser(2L, "22222222", Rol.ADMIN, true);
        otro.setRoles(new java.util.HashSet<>(Set.of(Rol.ADMIN, Rol.PROFESOR)));
        when(userRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("22222222@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMINISTRATIVO);
        request.setEnabled(true);

        service.actualizar(2L, request);

        verify(userRepository).save(argThat(u -> u.getRoles().equals(Set.of(Rol.ADMINISTRATIVO, Rol.PROFESOR))));
    }

    @Test
    void actualizar_lanzaAdministradorNotFoundException_siElUsuarioTargetNoEsGestionable() {
        User alumno = buildUser(5L, "55555555", Rol.ALUMNO, true);
        when(userRepository.findById(5L)).thenReturn(Optional.of(alumno));

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("55555555@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMIN);
        request.setEnabled(true);

        assertThatThrownBy(() -> service.actualizar(5L, request))
                .isInstanceOf(AdministradorNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_lanzaAdministradorNotFoundException_siElUsuarioTargetNoEsGestionable() {
        User alumno = buildUser(6L, "66666666", Rol.ALUMNO, true);
        when(userRepository.findById(6L)).thenReturn(Optional.of(alumno));

        assertThatThrownBy(() -> service.resetPassword(6L))
                .isInstanceOf(AdministradorNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void actualizar_lanzaAdministradorDatosDuplicadosException_siElEmailPerteneceAOtroUsuario() {
        User otro = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(userRepository.existsByEmail("colision@itec.edu.ar")).thenReturn(true);
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("colision@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMINISTRATIVO);
        request.setEnabled(true);

        assertThatThrownBy(() -> service.actualizar(2L, request))
                .isInstanceOf(AdministradorDatosDuplicadosException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void actualizar_noLanzaExcepcion_siElEmailYTelefonoNoCambian() {
        User otro = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail(otro.getEmail());
        request.setTelefono(otro.getTelefono());
        request.setRol(Rol.ADMINISTRATIVO);
        request.setEnabled(true);

        assertThatCode(() -> service.actualizar(2L, request)).doesNotThrowAnyException();

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository).save(any());
    }
}
