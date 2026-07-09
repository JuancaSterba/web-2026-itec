package ar.edu.itec1misiones.asistencias.client;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class HorarioClientTest {

    @Test
    void diasDeClaseLlamaACoreConBearerToken() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        InternalTokenService tokenService = new InternalTokenService("tu-clave-muy-segura-de-32-caracteres-o-mas-1234");

        String body = """
                {"data":[{"id":1,"diaSemana":"THURSDAY","comisionId":9,"materiaNombre":"X","modulos":[],"proximaFecha":"2026-07-09"}],"errors":[]}
                """;

        server.expect(requestTo("http://localhost:8082/api/horarios/comision/9"))
                .andExpect(header("Authorization", org.hamcrest.Matchers.startsWith("Bearer ")))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        HorarioClient client = new HorarioClient(restTemplate, tokenService, "http://localhost:8082");

        Set<DayOfWeek> dias = client.diasDeClase(9L);

        assertEquals(Set.of(DayOfWeek.THURSDAY), dias);
        server.verify();
    }
}
