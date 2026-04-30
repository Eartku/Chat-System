package com.chatapp.services.message;

import java.time.LocalDateTime;
import java.util.List;

import com.chatapp.dto.message.MessageCreateRequest;
import com.chatapp.dto.message.MessageResponse;
import com.chatapp.dto.message.MessageUpdateRequest;
import com.chatapp.exceptions.BadRequestException;
import com.chatapp.exceptions.ResourceNotFoundException;
import com.chatapp.mappers.MessageMapper;
import com.chatapp.models.Conversation;
import com.chatapp.models.ConversationMemberId;
import com.chatapp.models.Message;
import com.chatapp.repositories.ConversationMemberRepository;
import com.chatapp.repositories.ConversationRepository;
import com.chatapp.repositories.MessageRepository;
import com.chatapp.repositories.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService{

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;

    public MessageServiceImpl(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<MessageResponse> getMessageByConversationId(Long id) {
        findConversationOrThrow(id);
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(id);
        return MessageMapper.toResponseList(messages);
    }

    @Transactional
    @Override
    public MessageResponse sendMessage(Long conversationId, MessageCreateRequest request) {
        Conversation conversation = findConversationOrThrow(conversationId);
        validateCreateRequest(request);
        ensureUserExists(request.senderId());
        ensureUserIsConversationMember(conversationId, request.senderId());

        Message message = MessageMapper.requestToEntity(conversationId, request);
        message.setContent(normalizeContent(request.content()));
        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessage(savedMessage.getContent());
        conversationRepository.save(conversation);

        return MessageMapper.toResponse(savedMessage);
    }

    @Transactional
    @Override
    public MessageResponse updateMessageById(Long messageId, MessageUpdateRequest request) {
        Message message = findMessageOrThrow(messageId);
        ensureMessageIsNotDeleted(message);

        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        message.setContent(normalizeContent(request.content()));
        message.setEdited(true);

        return MessageMapper.toResponse(messageRepository.save(message));
    }

    @Transactional
    @Override
    public void deleteMessageById(Long messageId) {
        Message message = findMessageOrThrow(messageId);
        ensureMessageIsNotDeleted(message);

        message.setDeleted(true);
        messageRepository.save(message);
    }

    @Transactional
    @Override
    public MessageResponse markMessageAsRead(Long messageId) {
        Message message = findMessageOrThrow(messageId);
        ensureMessageIsNotDeleted(message);

        message.setReadAt(LocalDateTime.now());
        return MessageMapper.toResponse(messageRepository.save(message));
    }

    private Conversation findConversationOrThrow(Long conversationId) {
        if (conversationId == null) {
            throw new BadRequestException("Conversation id is required");
        }
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
    }

    private Message findMessageOrThrow(Long messageId) {
        if (messageId == null) {
            throw new BadRequestException("Message id is required");
        }
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
    }

    private void validateCreateRequest(MessageCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.senderId() == null) {
            throw new BadRequestException("Sender id is required");
        }
        normalizeContent(request.content());
    }

    private void ensureUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
    }

    private void ensureUserIsConversationMember(Long conversationId, Long userId) {
        ConversationMemberId memberId = new ConversationMemberId(conversationId, userId);
        if (!conversationMemberRepository.existsById(memberId)) {
            throw new BadRequestException("User is not a member of this conversation");
        }
    }

    private void ensureMessageIsNotDeleted(Message message) {
        if (message.isDeleted()) {
            throw new BadRequestException("Message has already been deleted");
        }
    }

    private String normalizeContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Message content is required");
        }
        return content.trim();
    }
}