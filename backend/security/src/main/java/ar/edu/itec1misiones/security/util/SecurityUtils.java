package ar.edu.itec1misiones.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.List;

public class SecurityUtils {

    private SecurityUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static String getUsername() {
        Authentication auth = getAuthentication();
        return (auth != null) ? auth.getName() : "ANÓNIMO";
    }

    public static boolean tieneRol(String rol) {
        Authentication auth = getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol));
    }

    public static Collection<? extends GrantedAuthority> getAuthorities() {
        Authentication auth = getAuthentication();
        return (auth != null) ? auth.getAuthorities() : List.of();
    }
}
