package com.alvescrm.auth.service;

import com.alvescrm.auth.model.CrmUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey key;
    private final long tokenHours;

    public JwtService(
            @Value("${app.security.jwt-secret}") String secret,
            @Value("${app.security.token-hours}") long tokenHours) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (io.jsonwebtoken.io.DecodingException exception) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET deve conter pelo menos 32 bytes (ou ser uma chave Base64 equivalente).");
        }
        if (tokenHours <= 0) {
            throw new IllegalArgumentException("JWT_TOKEN_HOURS precisa ser maior que zero.");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.tokenHours = tokenHours;
    }

    public String createToken(CrmUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.id().toString())
                .claim("email", user.email())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(tokenHours * 3600)))
                .signWith(key)
                .compact();
    }

    public Long getUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }

    public long getExpiresInSeconds() {
        return tokenHours * 3600;
    }
}
