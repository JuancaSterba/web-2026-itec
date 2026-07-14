package ar.edu.itec1misiones.client;

import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class NotasClientTest {

    @Test
    void obtenerPorCursadaLlamaAMsNotasConHeaderDeRolAdmin() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);

        String body = """
                {"data":[{"id":1,"cursadaId":5,"comisionId":9,"instancia":"Primer Parcial","nota":8.0,"fecha":"2026-06-01"}],"errors":[]}
                """;

        server.expect(requestTo("http://localhost:8084/api/calificaciones-parciales?cursadaId=5"))
                .andExpect(header("X-User-Roles", "ADMIN"))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        NotasClient client = new NotasClient(restTemplate, "http://localhost:8084");

        List<CalificacionParcialDto> resultado = client.obtenerPorCursada(5L);

        assertEquals(1, resultado.size());
        assertEquals("Primer Parcial", resultado.get(0).getInstancia());
        server.verify();
    }
}
