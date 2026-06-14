package ar.edu.itec1misiones.properties;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "cors")
@Getter
@Setter
@Slf4j
public class CorsProperties {

    private List<String> allowedOrigins = new ArrayList<>();

    @PostConstruct
    public void logOrigins() {
        log.info("🌍 CORS allowed origins (from CorsProperties): {}", allowedOrigins);
    }
}
