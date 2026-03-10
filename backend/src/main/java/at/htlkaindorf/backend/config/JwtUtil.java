package at.htlkaindorf.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey SECRET = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRATION_SHORT = 1000L * 60 * 60;
    private static final long EXPIRATION_LONG = 1000L * 60 * 60 * 24;

    public String generateToken(String email, boolean rememberMe) {
        long expiry = rememberMe ? EXPIRATION_LONG : EXPIRATION_SHORT;
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(SECRET)
                .compact();
    }

    public String generateToken(String email) {
        return generateToken(email, false);
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        return !getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }
}
