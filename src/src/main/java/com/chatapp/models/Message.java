package com.chatapp.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messId;

    @Column(name = "conv_id", nullable = false)
    private Long conversationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(nullable = false)
    private boolean edited = false;

    public Message(){}

    // Getter 
    public Long getId() {return messId;}
    public Long getConversationId() {return conversationId;}
    public void setId(Long id) {this.messId = id;}
    public Long getSenderId() {return senderId;}
    public String getContent() {return content;}
    public LocalDateTime getCreatedAt() {return createdAt;}
    public LocalDateTime getReadAt() {return readAt;}


    public void setConversationId(Long conversationId) {this.conversationId = conversationId;}
    public void setSenderId(Long senderId) {this.senderId = senderId;}
    public void setContent(String content) {this.content = content;}
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt;}

    public boolean isDeleted() {
        return deleted;
    }
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public boolean isEdited() {
        return edited;
    }

    public void setEdited(boolean edited) {
        this.edited = edited;
    }
}