package com.chatapp.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String displayName;

    private String avatarUrl;

    private boolean isOnline;

    private LocalDateTime lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;  // mặc định là USER

    private boolean isActive = true;

    public User() {}

    public User(String username, String password, String email) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.displayName = username; // mặc định displayName = username
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    // Getter
    public Long getUserId() {return userId;}
    public String getUsername() {return username;}
    public String getEmail() {return email;}
    public String getPassword() {return password;}
    public String getDisplayName() { return displayName; }
    public String getAvatarUrl() { return avatarUrl;}
    public boolean isOnline() { return isOnline; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public LocalDateTime getCreatedAt() { return createdAt;   }
    public UserRole getRole() { return role;}
    public boolean isActive() { return isActive; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) {this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password;}
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl;}
    public void setOnline(boolean isOnline) { this.isOnline = isOnline; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt;}
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt;}
    public void setRole(UserRole role) { this.role = role;}
    public void setActive(boolean isActive) {this.isActive = isActive; }
}