package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserLookupPortImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserLookupPortImpl service;

    private User buildUser(String username, String dni, String legajo) {
        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        user.setNombre("Ana");
        user.setApellido("Gómez");
        user.setDni(dni);
        user.setEmail("ana@itec.edu.ar");
        user.setTelefono("3760000000");
        user.setRoles(Set.of(Rol.ALUMNO));
        user.setLegajo(legajo);
        return user;
    }

    private User buildUser(String dni, String legajo) {
        return buildUser(dni, dni, legajo);
    }

    @Test
    void actualizarDniSiCambio_recalculaLegajoYSincronizaUsername_siElUsernameSeguiaElDniViejo() {
        User user = buildUser("30111222", "2024-30111222");
        when(userRepository.existsByDni("40999888")).thenReturn(false);
        when(userRepository.existsByUsername("40999888")).thenReturn(false);

        service.actualizarDniSiCambio(user, "40999888");

        assertThat(user.getDni()).isEqualTo("40999888");
        assertThat(user.getUsername()).isEqualTo("40999888");
        assertThat(user.getLegajo()).isEqualTo(LocalDate.now().getYear() + "-40999888");
    }

    @Test
    void actualizarDniSiCambio_noTocaElUsername_siEraPersonalizado() {
        // Ej. el seed de ADMIN: username="admin", dni="11111111" -- no siguen
        // la convencion username=DNI, no hay que tocar el username al
        // corregir el DNI.
        User user = buildUser("admin", "30111222", "2024-30111222");
        when(userRepository.existsByDni("40999888")).thenReturn(false);

        service.actualizarDniSiCambio(user, "40999888");

        assertThat(user.getDni()).isEqualTo("40999888");
        assertThat(user.getUsername()).isEqualTo("admin");
        assertThat(user.getLegajo()).isEqualTo(LocalDate.now().getYear() + "-40999888");
    }

    @Test
    void actualizarDniSiCambio_lanzaIllegalArgumentException_siElNuevoDniYaEstaEnUsoComoUsername() {
        User user = buildUser("30111222", "2024-30111222");
        when(userRepository.existsByDni("40999888")).thenReturn(false);
        when(userRepository.existsByUsername("40999888")).thenReturn(true);

        assertThatThrownBy(() -> service.actualizarDniSiCambio(user, "40999888"))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(user.getDni()).isEqualTo("30111222");
        assertThat(user.getUsername()).isEqualTo("30111222");
        assertThat(user.getLegajo()).isEqualTo("2024-30111222");
    }

    @Test
    void actualizarDniSiCambio_noHaceNada_siElDniNoCambio() {
        User user = buildUser("30111222", "2024-30111222");

        service.actualizarDniSiCambio(user, "30111222");

        assertThat(user.getDni()).isEqualTo("30111222");
        assertThat(user.getLegajo()).isEqualTo("2024-30111222");
    }

    @Test
    void actualizarDniSiCambio_noHaceNada_siElNuevoDniEsNull() {
        User user = buildUser("30111222", "2024-30111222");

        service.actualizarDniSiCambio(user, null);

        assertThat(user.getDni()).isEqualTo("30111222");
        assertThat(user.getLegajo()).isEqualTo("2024-30111222");
    }

    @Test
    void actualizarDniSiCambio_lanzaIllegalArgumentException_siElNuevoDniYaEstaEnUso() {
        User user = buildUser("30111222", "2024-30111222");
        when(userRepository.existsByDni("40999888")).thenReturn(true);

        assertThatThrownBy(() -> service.actualizarDniSiCambio(user, "40999888"))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(user.getDni()).isEqualTo("30111222");
        assertThat(user.getLegajo()).isEqualTo("2024-30111222");
    }

    @Test
    void actualizarEmailSiCambio_actualizaElEmail_siElEmailCambioYNoEstaEnUso() {
        User user = buildUser("30111222", "2024-30111222");
        when(userRepository.existsByEmail("nuevo@itec.edu.ar")).thenReturn(false);

        service.actualizarEmailSiCambio(user, "nuevo@itec.edu.ar");

        assertThat(user.getEmail()).isEqualTo("nuevo@itec.edu.ar");
    }

    @Test
    void actualizarEmailSiCambio_noHaceNada_siElEmailNoCambio() {
        User user = buildUser("30111222", "2024-30111222");

        service.actualizarEmailSiCambio(user, "ana@itec.edu.ar");

        assertThat(user.getEmail()).isEqualTo("ana@itec.edu.ar");
    }

    @Test
    void actualizarEmailSiCambio_lanzaIllegalArgumentException_siElNuevoEmailYaEstaEnUso() {
        User user = buildUser("30111222", "2024-30111222");
        when(userRepository.existsByEmail("nuevo@itec.edu.ar")).thenReturn(true);

        assertThatThrownBy(() -> service.actualizarEmailSiCambio(user, "nuevo@itec.edu.ar"))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(user.getEmail()).isEqualTo("ana@itec.edu.ar");
    }
}
