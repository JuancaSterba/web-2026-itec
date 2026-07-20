package ar.edu.itec1misiones.client;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.CalificacionMesaResponse;
import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Llama a ms-notas para traer las notas de una cursada. ms-notas confia en el
 * header X-User-Roles (mismo mecanismo que usa el Gateway) en vez de un JWT
 * real, asi que Core no necesita mintear token para esta direccion.
 */
@Component
public class NotasClient {

    private final RestTemplate restTemplate;
    private final String notasApiUrl;

    public NotasClient(RestTemplate restTemplate, @Value("${notas.api.url}") String notasApiUrl) {
        this.restTemplate = restTemplate;
        this.notasApiUrl = notasApiUrl;
    }

    public List<CalificacionParcialDto> obtenerPorCursada(Long cursadaId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Roles", "ADMIN");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = notasApiUrl + "/api/calificaciones-parciales?cursadaId=" + cursadaId;
        ResponseEntity<ApiResponse<CalificacionParcialDto>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity,
                new ParameterizedTypeReference<ApiResponse<CalificacionParcialDto>>() {});

        ApiResponse<CalificacionParcialDto> body = response.getBody();
        return body != null && body.getData() != null ? body.getData() : List.of();
    }

    public List<CalificacionMesaResponse> obtenerPorMesa(Long mesaExamenId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Roles", "ADMIN");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = notasApiUrl + "/api/notas/mesas?mesaExamenId=" + mesaExamenId;
        ResponseEntity<ApiResponse<CalificacionMesaResponse>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity,
                new ParameterizedTypeReference<ApiResponse<CalificacionMesaResponse>>() {});

        ApiResponse<CalificacionMesaResponse> body = response.getBody();
        return body != null && body.getData() != null ? body.getData() : List.of();
    }
}
