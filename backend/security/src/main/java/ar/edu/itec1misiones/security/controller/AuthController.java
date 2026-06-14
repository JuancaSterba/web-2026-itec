package ar.edu.itec1misiones.security.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.security.constants.SecurityConstants;
import ar.edu.itec1misiones.security.dto.LoginRequest;
import ar.edu.itec1misiones.security.dto.LoginResponse;
import ar.edu.itec1misiones.security.service.AuthServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(SecurityConstants.AUTH_BASE_PATH)
public class AuthController {

    private final AuthServiceImpl authServiceImpl;

    public AuthController(AuthServiceImpl authServiceImpl) {
        this.authServiceImpl = authServiceImpl;
    }

    @PostMapping(SecurityConstants.LOGIN_PATH)
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {

        String token = authServiceImpl.login(request.getUsername(), request.getPassword());
        LoginResponse loginResponse = new LoginResponse(token);

        ApiResponse<LoginResponse> response = ApiResponse.<LoginResponse>builder()
                .meta(MetaBuilderHelper.buildMeta(servletRequest))
                .data(List.of(loginResponse))
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping(SecurityConstants.VALIDATE_PATH)
    public ResponseEntity<ApiResponse<String>> validate(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String tokenHeader,
            HttpServletRequest request) {

        String token = tokenHeader.replace(SecurityConstants.TOKEN_PREFIX, SecurityConstants.TOKEN_PREFIX_REPLACE);
        var user = authServiceImpl.validateToken(token);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .data(List.of(SecurityConstants.MSG_TOKEN_VALID + user.getUsername()))
                        .build()
        );
    }
}
