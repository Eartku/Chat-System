package com.chatapp.services.conversation;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.chatapp.dto.conversation.*;
import com.chatapp.exceptions.BadRequestException;
import com.chatapp.exceptions.DuplicateResourceException;
import com.chatapp.exceptions.ResourceNotFoundException;
import com.chatapp.mappers.ConversationMapper;
import com.chatapp.models.Conversation;
import com.chatapp.models.ConversationMember;
import com.chatapp.models.ConversationMemberId;
import com.chatapp.models.ConversationType;
import com.chatapp.models.MemberRole;
import com.chatapp.models.User;
import com.chatapp.repositories.ConversationMemberRepository;
import com.chatapp.repositories.ConversationRepository;
import com.chatapp.repositories.UserRepository;

@Service
@Transactional(readOnly = true)
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;

    public ConversationServiceImpl(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ConversationSummaryResponse> getAllConversation() {
        List<Conversation> convs = conversationRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"));
        List<ConversationSummaryResponse> responses = new ArrayList<>();
        for (Conversation c : convs) {
            responses.add(ConversationMapper.toSummary(c));
        }
        return responses;
    }

    @Override
    public ConversationResponse getConversationById(Long id) {
        Conversation conv = findConversationOrThrow(id);
        return ConversationMapper.toResponse(conv, getMemberById(id));
    }

    @Transactional
    @Override
    public ConversationResponse createConversation(ConversationCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        ConversationType type = request.type();
        if (type == null) {
            throw new BadRequestException("Conversation type is required");
        }

        List<Long> memberIds = requireMemberIds(request.memberIds(), "memberIds");
        validateMemberCount(type, memberIds);

        String name = normalizeText(request.name());
        if (type == ConversationType.GROUP && name == null) {
            throw new BadRequestException("Group conversation name is required");
        }

        if (type == ConversationType.PRIVATE && hasPrivateConversationWithMembers(memberIds)) {
            throw new DuplicateResourceException("Private conversation already exists");
        }

        List<User> users = findUsersOrThrow(memberIds);
        Conversation conversation = ConversationMapper.requestToEntity(request);
        conversation.setName(name);
        conversation.setImage(normalizeText(request.imgUrl()));

        Conversation savedConversation = conversationRepository.save(conversation);
        List<ConversationMember> members = new ArrayList<>();
        for (int i = 0; i < users.size(); i++) {
            MemberRole role = type == ConversationType.GROUP && i == 0
                    ? MemberRole.ADMIN
                    : MemberRole.MEMBER;
            members.add(new ConversationMember(savedConversation, users.get(i), role));
        }

        conversationMemberRepository.saveAll(members);
        return ConversationMapper.toResponse(savedConversation, getMemberById(savedConversation.getConvId()));
    }

    @Transactional
    @Override
    public ConversationResponse updateConversationById(Long id, ConversationUpdateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        Conversation conversation = findConversationOrThrow(id);

        if (request.name() != null) {
            String name = normalizeText(request.name());
            if (name == null) {
                throw new BadRequestException("Conversation name cannot be blank");
            }
            conversation.setName(name);
        }

        if (request.imgUrl() != null) {
            conversation.setImage(normalizeText(request.imgUrl()));
        }

        List<Long> addMemberIds = normalizeMemberIds(request.addMemberIds(), "addMemberIds");
        List<Long> removeMemberIds = normalizeMemberIds(request.removeMemberIds(), "removeMemberIds");

        if (!addMemberIds.isEmpty() || !removeMemberIds.isEmpty()) {
            updateMembers(conversation, addMemberIds, removeMemberIds);
        }

        Conversation savedConversation = conversationRepository.save(conversation);
        return ConversationMapper.toResponse(savedConversation, getMemberById(id));
    }

    @Transactional
    @Override
    public void deleteConversationById(Long id) {
        Conversation conversation = findConversationOrThrow(id);
        conversationMemberRepository.deleteAll(getMemberById(id));
        conversationRepository.delete(conversation);
    }

    public List<ConversationMember> getMemberById(Long id) {
        return conversationMemberRepository.findByConversation_ConvId(id);
    }

    private Conversation findConversationOrThrow(Long id) {
        if (id == null) {
            throw new BadRequestException("Conversation id is required");
        }
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + id));
    }

    private List<Long> requireMemberIds(List<Long> memberIds, String fieldName) {
        if (memberIds == null || memberIds.isEmpty()) {
            throw new BadRequestException(fieldName + " is required");
        }
        return normalizeMemberIds(memberIds, fieldName);
    }

    private List<Long> normalizeMemberIds(List<Long> memberIds, String fieldName) {
        if (memberIds == null) {
            return List.of();
        }

        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>();
        for (Long memberId : memberIds) {
            if (memberId == null) {
                throw new BadRequestException(fieldName + " cannot contain null");
            }
            if (!uniqueIds.add(memberId)) {
                throw new BadRequestException(fieldName + " cannot contain duplicate user id: " + memberId);
            }
        }
        return new ArrayList<>(uniqueIds);
    }

    private void validateMemberCount(ConversationType type, List<Long> memberIds) {
        if (type == ConversationType.PRIVATE && memberIds.size() != 2) {
            throw new BadRequestException("Private conversation must have exactly 2 members");
        }

        if (type == ConversationType.GROUP && memberIds.size() < 2) {
            throw new BadRequestException("Group conversation must have at least 2 members");
        }
    }

    private List<User> findUsersOrThrow(List<Long> userIds) {
        if (userIds.isEmpty()) {
            return List.of();
        }

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));
        List<Long> missingIds = userIds.stream()
                .filter(userId -> !usersById.containsKey(userId))
                .toList();

        if (!missingIds.isEmpty()) {
            throw new ResourceNotFoundException("User not found: " + missingIds.get(0));
        }

        return userIds.stream()
                .map(usersById::get)
                .toList();
    }

    private boolean hasPrivateConversationWithMembers(List<Long> memberIds) {
        Set<Long> targetIds = new HashSet<>(memberIds);

        return conversationMemberRepository.findByUser_UserIdIn(targetIds).stream()
                .filter(member -> member.getConversation().getType() == ConversationType.PRIVATE)
                .collect(Collectors.groupingBy(
                        member -> member.getConversation().getConvId(),
                        Collectors.mapping(member -> member.getUser().getUserId(), Collectors.toSet())))
                .values()
                .stream()
                .anyMatch(existingIds -> existingIds.equals(targetIds));
    }

    private void updateMembers(Conversation conversation, List<Long> addMemberIds, List<Long> removeMemberIds) {
        if (conversation.getType() == ConversationType.PRIVATE) {
            throw new BadRequestException("Cannot add or remove members from a private conversation");
        }

        Set<Long> overlapIds = new HashSet<>(addMemberIds);
        overlapIds.retainAll(removeMemberIds);
        if (!overlapIds.isEmpty()) {
            throw new BadRequestException("Cannot add and remove the same user: " + overlapIds.iterator().next());
        }

        Long conversationId = conversation.getConvId();
        List<ConversationMember> currentMembers = getMemberById(conversationId);
        Set<Long> currentMemberIds = currentMembers.stream()
                .map(member -> member.getUser().getUserId())
                .collect(Collectors.toSet());

        for (Long userId : removeMemberIds) {
            if (!currentMemberIds.contains(userId)) {
                throw new ResourceNotFoundException("Conversation member not found: " + userId);
            }
        }

        for (Long userId : addMemberIds) {
            if (currentMemberIds.contains(userId)) {
                throw new DuplicateResourceException("User already in conversation: " + userId);
            }
        }

        Set<Long> nextMemberIds = new HashSet<>(currentMemberIds);
        nextMemberIds.removeAll(removeMemberIds);
        nextMemberIds.addAll(addMemberIds);
        if (nextMemberIds.size() < 2) {
            throw new BadRequestException("Group conversation must have at least 2 members");
        }

        List<User> usersToAdd = findUsersOrThrow(addMemberIds);

        if (!removeMemberIds.isEmpty()) {
            List<ConversationMemberId> idsToRemove = removeMemberIds.stream()
                    .map(userId -> new ConversationMemberId(conversationId, userId))
                    .toList();
            conversationMemberRepository.deleteAllById(idsToRemove);
        }

        if (!usersToAdd.isEmpty()) {
            List<ConversationMember> membersToAdd = usersToAdd.stream()
                    .map(user -> new ConversationMember(conversation, user, MemberRole.MEMBER))
                    .toList();
            conversationMemberRepository.saveAll(membersToAdd);
        }

        ensureGroupHasAdmin(conversationId);
    }

    private void ensureGroupHasAdmin(Long conversationId) {
        List<ConversationMember> members = getMemberById(conversationId);
        boolean hasAdmin = members.stream()
                .anyMatch(member -> MemberRole.ADMIN.equals(member.getRole()));

        if (!hasAdmin && !members.isEmpty()) {
            ConversationMember firstMember = members.get(0);
            firstMember.setRole(MemberRole.ADMIN);
            conversationMemberRepository.save(firstMember);
        }
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
