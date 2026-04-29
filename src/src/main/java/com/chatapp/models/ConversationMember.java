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

    public ConversationMember() {}

    public ConversationMember(Conversation conversation, User user, MemberRole role) {
        this.conversation = conversation;
        this.user = user;
        this.id = new ConversationMemberId(conversation.getConvId(), user.getUserId());
        this.joinedAt = LocalDateTime.now();
        if (role != null) {
            this.role = role;
        }
    }

    public ConversationMemberId getId(){return this.id;}

    public User getUser(){ return this.user; }

    public Conversation getConversation(){ return this.conversation; }

    public MemberRole getRole() { return role; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }

    public void setId(ConversationMemberId id) { this.id = id; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    public void setUser(User user) { this.user = user; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    public void setRole(MemberRole role) { this.role = role; }
}
