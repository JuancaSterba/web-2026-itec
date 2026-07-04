package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "dni"),
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "telefono")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    // ✅ Datos personales comunes para todos los roles
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<Rol> roles = new HashSet<>();

    // Cuenta habilitada para loguearse. Default true para no romper usuarios
    // existentes (columnDefinition cubre el ALTER TABLE sobre filas ya
    // insertadas); false para Alumnos/Profesores auto-creados, que todavia
    // no tienen UI propia (ver docs/Reglas_de_Negocio.md).
    @Column(nullable = false, columnDefinition = "boolean default true")
    @Setter(AccessLevel.PUBLIC)
    @Getter(AccessLevel.NONE)
    private boolean enabled = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.name()))
                .toList();
    }

    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return enabled; }
}
