package com.chatapp.models;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "conversation_user", uniqueConstraints = @UniqueConstraint(columnNames = {"conv_id", "user_id"}))
public class ConversationMember {
    @EmbeddedId
    private ConversationMemberId id;

    @ManyToOne
    @MapsId("convId")
    @JoinColumn(name = "conv_id", nullable = false,
        foreignKey = @jakarta.persistence.ForeignKey(name = "fk_conv_conv_member"))
    private Conversation conversation;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false,
        foreignKey = @jakarta.persistence.ForeignKey(name = "fk_user_conv_member"))
    private User user;
    
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    private MemberRole role = MemberRole.MEMBER;

    public MemberRole getRole() { return role; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }

    public void setRole(MemberRole role) { this.role = role; }
}

