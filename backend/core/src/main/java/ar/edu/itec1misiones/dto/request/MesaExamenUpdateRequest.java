package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MesaExamenUpdateRequest {

    @NotNull(message = "El tribunal no puede ser nulo")
    private List<Long> tribunalIds;
}
