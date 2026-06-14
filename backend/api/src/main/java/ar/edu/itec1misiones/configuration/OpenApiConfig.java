package ar.edu.itec1misiones.configuration;

import ar.edu.itec1misiones.constants.OpenApiConstants;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.*;

@Configuration
@ComponentScan(basePackages = "ar.edu.itec1misiones")
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(OpenApiConstants.OPEN_API_TITTLE)
                        .version(OpenApiConstants.OPEN_API_VERSION)
                        .description(OpenApiConstants.OPEN_API_DESCRIPTION));
    }
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("itec")
                .pathsToMatch("/**")
                .build();
    }
}
