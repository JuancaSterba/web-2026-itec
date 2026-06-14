package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.dto.Meta;
import jakarta.servlet.http.HttpServletRequest;

public class MetaBuilderHelper {
    public static Meta buildMeta(HttpServletRequest request) {
        return Meta.builder()
                .method(request.getMethod())
                .operation(request.getRequestURI())
                .build();
    }
}
