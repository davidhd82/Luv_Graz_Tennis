package at.htlkaindorf.backend.config;

import at.htlkaindorf.backend.dtos.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtUnauthorizedEndPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String message = resolveErrorMessage(request, authException);

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .path(request.getRequestURI())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(message)
                .status(HttpStatus.UNAUTHORIZED.value())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }

    private String resolveErrorMessage(HttpServletRequest request, AuthenticationException authException) {
        String jwtError = (String) request.getAttribute("jwt_error");
        if (jwtError != null) {
            return jwtError;
        }
        return authException.getMessage() != null ? authException.getMessage() : "Unauthorized";
    }
}
