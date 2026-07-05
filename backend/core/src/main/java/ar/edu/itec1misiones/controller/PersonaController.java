package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
import ar.edu.itec1misiones.exception.PersonaNotFoundException;
import ar.edu.itec1misiones.service.UserLookupPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
@Tag(name = "Personas", description = "Búsqueda de personas ya registradas por DNI (auto-detect en altas)")
public class PersonaController {

    private final UserLookupPort userLookupPort;

    public PersonaController(UserLookupPort userLookupPort) {
        this.userLookupPort = userLookupPort;
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Buscar si ya existe una persona con ese DNI (cualquier rol)")
    public ResponseEntity<ApiResponse<PersonaResumenResponse>> buscarPorDni(
            @PathVariable String dni,
            HttpServletRequest httpRequest) {

        PersonaResumenResponse persona = userLookupPort.buscarPorDni(dni)
                .orElseThrow(() -> new PersonaNotFoundException(dni));

        return ResponseEntity.ok(
                ApiResponse.<PersonaResumenResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(persona))
                        .build()
        );
    }
}
