package com.chatapp.models;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class ConversationMemberId implements Serializable {

    private Long convId;
    private Long userId;

    public ConversationMemberId() {}

    // constructor, equals, hashCode
    public ConversationMemberId(Long convId, Long userId) {
        this.convId = convId;
        this.userId = userId;
    }

    public Long getConvId() {return convId;}
    public Long getUserId() {return userId;}

    public void setConvId(Long convId) {this.convId = convId;}
    public void setUserId(Long userId) {this.userId = userId;}

    //Equals
    @Override
    public boolean equals(Object obj){
        if(this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ConversationMemberId that = (ConversationMemberId) obj;
        return Objects.equals(convId, that.convId) && Objects.equals(userId, that.userId);
    }

    //hashCode
    @Override
    public int hashCode(){
        return Objects.hash(convId, userId);
    }
}
