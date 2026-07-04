package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Alta de un solo paso para Profesores, mismo patron que AlumnoRegistroDTO.
 * El servicio crea el Usuario asociado automaticamente: username=DNI,
 * password=DNI (encriptada), rol=PROFESOR, enabled=false.
 */
@Data
public class ProfesorRegistroDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{7,8}", message = "El DNI debe tener 7 u 8 dígitos numéricos")
    private String dni;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{6,15}", message = "El teléfono debe contener entre 6 y 15 números")
    private String telefono;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;
}
