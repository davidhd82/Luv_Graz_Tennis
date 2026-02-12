package at.htlkaindorf.backend.config;

import at.htlkaindorf.backend.dtos.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        String message = resolveErrorMessage(accessDeniedException);

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .path(request.getRequestURI())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message(message)
                .status(HttpStatus.FORBIDDEN.value())
                .build();

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }

    private String resolveErrorMessage(AccessDeniedException accessDeniedException) {
        return accessDeniedException.getMessage() != null ? accessDeniedException.getMessage() : "Access denied";
    }
}
