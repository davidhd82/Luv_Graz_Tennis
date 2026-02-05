package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.LoginRequest;
import at.htlkaindorf.backend.dtos.RegisterRequest;
import at.htlkaindorf.backend.dtos.AuthResponseDto;
import at.htlkaindorf.backend.dtos.ResendVerificationRequest;
import at.htlkaindorf.backend.entities.User;
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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(409).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Verification token expired");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setTokenExpiryDate(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully!");
    }

    // NEU: Endpoint zum Überprüfen des Verifizierungsstatus
    @GetMapping("/check-verification")
    public ResponseEntity<Map<String, Object>> checkVerification(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        Map<String, Object> response = new HashMap<>();
        response.put("enabled", user.isEnabled());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());

        return ResponseEntity.ok(response);
    }

    // NEU: Endpoint zum erneuten Senden der Verifizierungs-Email
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        User user = userOptional.get();

        // Wenn User bereits verifiziert ist
        if (user.isEnabled()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email is already verified");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String newToken = authService.generateVerificationToken();
            user.setVerificationToken(newToken);
            user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            emailService.sendVerificationEmail(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification email sent successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error sending verification email");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
