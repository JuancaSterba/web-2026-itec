package ar.edu.itec1misiones.notas.client;

import ar.edu.itec1misiones.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
public class MesaExamenClient {

    private final RestTemplate restTemplate;
    private final InternalTokenService tokenService;
    private final String coreApiUrl;

    public MesaExamenClient(RestTemplate restTemplate, InternalTokenService tokenService,
                          @Value("${core.api.url}") String coreApiUrl) {
        this.restTemplate = restTemplate;
        this.tokenService = tokenService;
        this.coreApiUrl = coreApiUrl;
    }

    public boolean isMesaAbierta(Long mesaExamenId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenService.mintToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = coreApiUrl + "/api/mesas-examen/" + mesaExamenId;
        ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity,
                new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {});

        ApiResponse<Map<String, Object>> body = response.getBody();
        if (body != null && body.getData() != null && !body.getData().isEmpty()) {
            Map<String, Object> mesa = body.getData().get(0);
            return !"CERRADA".equals(mesa.get("estado"));
        }
        return false;
    }
}
