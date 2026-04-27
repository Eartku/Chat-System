package com.chatapp.models;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class ConversationMemberId implements Serializable {

    private Long convId;
    private Long userId;

    // constructor, equals, hashCode
}