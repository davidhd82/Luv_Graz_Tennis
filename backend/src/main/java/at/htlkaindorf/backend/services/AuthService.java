package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.dtos.LoginRequest;
import at.htlkaindorf.backend.dtos.RegisterRequest;
import at.htlkaindorf.backend.dtos.AuthResponseDto;
import at.htlkaindorf.backend.dtos.ForgotPasswordRequest;
import at.htlkaindorf.backend.dtos.ResetPasswordRequest;
import at.htlkaindorf.backend.entities.Role;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.exceptions.EmailNotVerifiedException;
import at.htlkaindorf.backend.exceptions.InvalidCredentialsException;
import at.htlkaindorf.backend.exceptions.InvalidTokenException;
import at.htlkaindorf.backend.exceptions.TokenExpiredException;
import at.htlkaindorf.backend.exceptions.UserAlreadyExistsException;
import at.htlkaindorf.backend.mapper.UserMapper;
import at.htlkaindorf.backend.repositories.UserRepository;
import at.htlkaindorf.backend.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public AuthResponseDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists!");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPostalCode(request.getPostalCode());
        user.setCity(request.getCity());
        user.setStreet(request.getStreet());
        user.setMobile(request.getMobile());
        user.setSalutation(request.getSalutation());
        user.setTitle(request.getTitle());
        user.setEnabled(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
        user.setRole(Role.USER);
        user.setMembershipPaid(false);

        userRepository.save(user);
        emailService.sendVerificationEmail(user);

        AuthResponseDto response = userMapper.toAuthDTO(user);
        response.setToken(null);
        return response;
    }

    public AuthResponseDto login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Ungültige Anmeldedaten"));

        if (!user.isEnabled()) {
            throw new EmailNotVerifiedException("Bitte bestätige zuerst deine E-Mail-Adresse.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Ungültige Anmeldedaten");
        }

        boolean rememberMe = request.isRememberMe();
        String token = jwtUtil.generateToken(user.getEmail(), rememberMe);
        long expiryMs = rememberMe ? 1000L * 60 * 60 * 24 : 1000L * 60 * 60;
        long tokenExpiry = System.currentTimeMillis() + expiryMs;

        return new AuthResponseDto(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isAdmin(),
                tokenExpiry
        );
    }

    public String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user, resetLink);
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Ungültiger oder abgelaufener Reset-Token"));

        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }
}
