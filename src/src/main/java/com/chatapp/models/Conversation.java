package com.chatapp.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long convId;

    @Enumerated(EnumType.STRING)
    private ConversationType type;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp                      // tự update mỗi khi save
    private LocalDateTime updatedAt;      // cần để sort danh sách chat

    private String name;                  // group chat name
    private String image;                 // group avatar
    private String lastMessage;           // hiển thị preview tin nhắn cuối

    public Conversation() {}

    // Getters
    public Long getConvId() { return convId; }
    public ConversationType getType() { return type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getName() { return name; }
    public String getImage() { return image; }
    public String getLastMessage() { return lastMessage; }

    // Setters
    public void setType(ConversationType type) { this.type = type; }
    public void setName(String name) { this.name = name; }
    public void setImage(String image) { this.image = image; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
}