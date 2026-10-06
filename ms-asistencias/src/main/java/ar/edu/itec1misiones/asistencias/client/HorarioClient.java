package ar.edu.itec1misiones.asistencias.client;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.asistencias.dto.HorarioClaseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class HorarioClient {

    private final RestTemplate restTemplate;
    private final InternalTokenService tokenService;
    private final String coreApiUrl;

    public HorarioClient(RestTemplate restTemplate, InternalTokenService tokenService,
                          @Value("${core.api.url}") String coreApiUrl) {
        this.restTemplate = restTemplate;
        this.tokenService = tokenService;
        this.coreApiUrl = coreApiUrl;
    }

    public Set<DayOfWeek> diasDeClase(Long comisionId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenService.mintToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = coreApiUrl + "/api/horarios/comision/" + comisionId;
        ResponseEntity<ApiResponse<HorarioClaseDto>> response = restTemplate.exchange(
                url, HttpMethod.GET, entity,
                new ParameterizedTypeReference<ApiResponse<HorarioClaseDto>>() {});

        ApiResponse<HorarioClaseDto> body = response.getBody();
        List<HorarioClaseDto> horarios = body != null && body.getData() != null ? body.getData() : List.of();
        return horarios.stream().map(h -> DayOfWeek.valueOf(h.getDiaSemana())).collect(Collectors.toSet());
    }
}
