package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.dtos.LoginRequest;
import at.htlkaindorf.backend.dtos.RegisterRequest;
import at.htlkaindorf.backend.dtos.AuthResponseDto;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.mapper.UserMapper;
import at.htlkaindorf.backend.repositories.UserRepository;
import at.htlkaindorf.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
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

    public AuthResponseDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
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

        userRepository.save(user);
        emailService.sendVerificationEmail(user);

        AuthResponseDto response = userMapper.toAuthDTO(user);
        response.setToken(null);
        return response;
    }

    public AuthResponseDto login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Ungültige Anmeldedaten"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Bitte bestätige zuerst deine E-Mail-Adresse.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Ungültige Anmeldedaten");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponseDto(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
