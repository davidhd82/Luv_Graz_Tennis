package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.LoginRequest;
import at.htlkaindorf.backend.dtos.RegisterRequest;
import at.htlkaindorf.backend.dtos.AuthResponseDto;
import at.htlkaindorf.backend.dtos.ResendVerificationRequest;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.exceptions.*;
import at.htlkaindorf.backend.repositories.UserRepository;
import at.htlkaindorf.backend.services.AuthService;
import at.htlkaindorf.backend.services.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        if (user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Verification token expired");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setTokenExpiryDate(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully!");
    }

    @GetMapping("/check-verification")
    public ResponseEntity<Map<String, Object>> checkVerification(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("enabled", user.isEnabled());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new EmailAlreadyVerifiedException("Email is already verified");
        }

        String newToken = authService.generateVerificationToken();
        user.setVerificationToken(newToken);
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification email sent successfully");
        return ResponseEntity.ok(response);
    }
}
