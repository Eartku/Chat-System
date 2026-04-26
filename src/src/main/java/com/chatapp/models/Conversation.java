package com.chatapp.models;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversation")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long convId;

    @Enumerated(EnumType.STRING)
    private ConversationType type;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    public Conversation() {}

    public Long getConvId() {
        return convId;
    }

    public ConversationType getType() {
        return type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setType(ConversationType type) {
        this.type = type;
    }
}
