package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Resumen de una persona ya existente en el sistema (cualquiera sea su rol
 * actual), usado para el auto-detect por DNI en los formularios de alta:
 * si existe, el frontend oculta los datos personales y solo pide los
 * campos propios del rol nuevo a agregar.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonaResumenResponse {
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String legajo;
    private Set<Rol> roles;
}
