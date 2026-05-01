package com.chatapp.services.auth;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(String username) { //Sinh token
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) { //đọc, xác thực username
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    private Date extractExpiration(String token) { //ĐỌc hạn dùng token
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();// lấy expiration thay vì getSubject
    }
    public boolean isTokenValid(String token, UserDetails userDetails) { //Kiểm tra độ hợp lệ token
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token) { //Kiểm tra thời hạn token
        return extractExpiration(token).before(new Date());
    }

    private Key getSignKey() { //tạo khóa ký
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    // private Claims extractAllClaims(String token) {
    //     return Jwts.parserBuilder()
    //             .setSigningKey(getSignKey())
    //             .build()
    //             .parseClaimsJws(token)
    //             .getBody();
    // }
    // public long getRemainingTime(String token) {
    //     Date expiration = extractExpiration(token);
    //     long remaining = expiration.getTime() - System.currentTimeMillis();
    //     return Math.max(0, remaining); // Trả về 0 nếu đã hết hạn
    // }
}