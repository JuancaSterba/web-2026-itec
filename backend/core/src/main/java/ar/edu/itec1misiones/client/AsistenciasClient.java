package ar.edu.itec1misiones.client;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.ResumenAsistenciaDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

/**
 * Pide a ms-asistencias el resumen de regularidad (70 %) de una cursada. Igual
 * que NotasClient, se autentica con el header X-User-Roles. Si el servicio no
 * responde, el cierre no puede decidir la condicion: 503 (RF-13, RF-24).
 */
@Component
public class AsistenciasClient {

    static final String MENSAJE_NO_DISPONIBLE = "No se pudieron obtener las asistencias. Intentá más tarde.";

    private final RestTemplate restTemplate;
    private final String asistenciasApiUrl;

    public AsistenciasClient(RestTemplate restTemplate,
                             @Value("${asistencias.api.url:http://localhost:8083}") String asistenciasApiUrl) {
        this.restTemplate = restTemplate;
        this.asistenciasApiUrl = asistenciasApiUrl;
    }

    public ResumenAsistenciaDto obtenerResumen(Long cursadaId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Roles", "ADMIN");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = asistenciasApiUrl + "/api/asistencias/resumen?cursadaIds=" + cursadaId;
        try {
            ResponseEntity<ApiResponse<ResumenAsistenciaDto>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity,
                    new ParameterizedTypeReference<ApiResponse<ResumenAsistenciaDto>>() {});

            ApiResponse<ResumenAsistenciaDto> body = response.getBody();
            if (body == null || body.getData() == null || body.getData().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, MENSAJE_NO_DISPONIBLE);
            }
            return body.getData().get(0);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, MENSAJE_NO_DISPONIBLE, e);
        }
    }
}
