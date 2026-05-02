package com.chatapp.services.conversation;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatapp.dto.conversation.ConversationCreateRequest;
import com.chatapp.dto.conversation.ConversationResponse;
import com.chatapp.dto.conversation.ConversationSummaryResponse;
import com.chatapp.dto.conversation.ConversationUpdateRequest;
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
import com.chatapp.services.auth.AuthService;

@Service
@Transactional(readOnly = true)
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public ConversationServiceImpl(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            UserRepository userRepository,
            AuthService authService) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    // ==================== PUBLIC METHODS ====================

    @Override
    public List<ConversationSummaryResponse> getAllConversation() {
        User currentUser = authService.getCurrentUserEntity();
        return conversationRepository.findByUserId(currentUser.getUserId())
                .stream()
                .map(ConversationMapper::toSummary)
                .toList();
    }

    @Override
    public ConversationResponse getConversationById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Conversation conv = findConversationOrThrow(id);
        ensureCurrentUserIsMember(id, currentUser.getUserId()); // chỉ cần là member
        return ConversationMapper.toResponse(conv, getMemberById(id));
    }

    @Transactional
    @Override
    public ConversationResponse createConversation(ConversationCreateRequest request) {
        if (request == null) throw new BadRequestException("Request body is required");

        ConversationType type = request.type();
        if (type == null) throw new BadRequestException("Conversation type is required");

        User currentUser = authService.getCurrentUserEntity();

        List<Long> memberIds = requireMemberIds(request.memberIds(), "memberIds");

        if (memberIds.contains(currentUser.getUserId())) {
            throw new BadRequestException("memberIds cannot contain yourself");
        }

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
        Conversation savedConv = conversationRepository.save(conversation);

        List<ConversationMember> members = new ArrayList<>();
        members.add(new ConversationMember(savedConv, currentUser, MemberRole.ADMIN)); // current user là ADMIN
        for (User user : users) {
            members.add(new ConversationMember(savedConv, user, MemberRole.MEMBER));
        }
        conversationMemberRepository.saveAll(members);

        return ConversationMapper.toResponse(savedConv, getMemberById(savedConv.getConvId()));
    }

    @Transactional
    @Override
    public ConversationResponse updateConversationById(Long id, ConversationUpdateRequest request) {
        if (request == null) throw new BadRequestException("Request body is required");

        User currentUser = authService.getCurrentUserEntity();
        ensureCurrentUserIsAdmin(id, currentUser.getUserId()); // chỉ ADMIN mới update được

        Conversation conversation = findConversationOrThrow(id);

        if (request.name() != null) {
            String name = normalizeText(request.name());
            if (name == null) throw new BadRequestException("Conversation name cannot be blank");
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

        return ConversationMapper.toResponse(conversationRepository.save(conversation), getMemberById(id));
    }

    @Transactional
    @Override
    public void deleteConversationById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        ensureCurrentUserIsAdmin(id, currentUser.getUserId()); // chỉ ADMIN mới xóa được

        Conversation conversation = findConversationOrThrow(id);
        conversationMemberRepository.deleteAll(getMemberById(id));
        conversationRepository.delete(conversation);
    }

    // ==================== PRIVATE HELPERS ====================

    private List<ConversationMember> getMemberById(Long id) {
        return conversationMemberRepository.findByConversation_ConvId(id);
    }

    private Conversation findConversationOrThrow(Long id) {
        if (id == null) throw new BadRequestException("Conversation id is required");
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + id));
    }

    private void ensureCurrentUserIsMember(Long convId, Long userId) {
        ConversationMemberId memberId = new ConversationMemberId(convId, userId);
        if (!conversationMemberRepository.existsById(memberId)) {
            throw new BadRequestException("You are not a member of this conversation");
        }
    }

    private void ensureCurrentUserIsAdmin(Long convId, Long userId) {
        ConversationMemberId memberId = new ConversationMemberId(convId, userId);
        ConversationMember member = conversationMemberRepository.findById(memberId)
                .orElseThrow(() -> new BadRequestException("You are not a member of this conversation"));
        if (!MemberRole.ADMIN.equals(member.getRole())) {
            throw new BadRequestException("Only admin can perform this action");
        }
    }

    private List<Long> requireMemberIds(List<Long> memberIds, String fieldName) {
        if (memberIds == null || memberIds.isEmpty()) {
            throw new BadRequestException(fieldName + " is required");
        }
        return normalizeMemberIds(memberIds, fieldName);
    }

    private List<Long> normalizeMemberIds(List<Long> memberIds, String fieldName) {
        if (memberIds == null) return List.of();

        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>();
        for (Long id : memberIds) {
            if (id == null) throw new BadRequestException(fieldName + " cannot contain null");
            if (!uniqueIds.add(id)) throw new BadRequestException(fieldName + " cannot contain duplicate user id: " + id);
        }
        return new ArrayList<>(uniqueIds);
    }

    private void validateMemberCount(ConversationType type, List<Long> memberIds) {
        if (type == ConversationType.PRIVATE && memberIds.size() != 1) {
            throw new BadRequestException("Private conversation must have exactly 1 other member");
        }
        if (type == ConversationType.GROUP && memberIds.size() < 1) {
            throw new BadRequestException("Group conversation must have at least 1 other member");
        }
    }

    private List<User> findUsersOrThrow(List<Long> userIds) {
        if (userIds.isEmpty()) return List.of();

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        userIds.stream()
                .filter(id -> !usersById.containsKey(id))
                .findFirst()
                .ifPresent(id -> { throw new ResourceNotFoundException("User not found: " + id); });

        return userIds.stream().map(usersById::get).toList();
    }

    private boolean hasPrivateConversationWithMembers(List<Long> memberIds) {
        Set<Long> targetIds = new HashSet<>(memberIds);
        return conversationMemberRepository.findByUser_UserIdIn(targetIds).stream()
                .filter(m -> m.getConversation().getType() == ConversationType.PRIVATE)
                .collect(Collectors.groupingBy(
                        m -> m.getConversation().getConvId(),
                        Collectors.mapping(m -> m.getUser().getUserId(), Collectors.toSet())))
                .values().stream()
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
        Set<Long> currentMemberIds = getMemberById(conversationId).stream()
                .map(m -> m.getUser().getUserId())
                .collect(Collectors.toSet());

        removeMemberIds.stream()
                .filter(id -> !currentMemberIds.contains(id))
                .findFirst()
                .ifPresent(id -> { throw new ResourceNotFoundException("Conversation member not found: " + id); });

        addMemberIds.stream()
                .filter(currentMemberIds::contains)
                .findFirst()
                .ifPresent(id -> { throw new DuplicateResourceException("User already in conversation: " + id); });

        Set<Long> nextMemberIds = new HashSet<>(currentMemberIds);
        nextMemberIds.removeAll(removeMemberIds);
        nextMemberIds.addAll(addMemberIds);
        if (nextMemberIds.size() < 2) {
            throw new BadRequestException("Group conversation must have at least 2 members");
        }

        if (!removeMemberIds.isEmpty()) {
            conversationMemberRepository.deleteAllById(
                removeMemberIds.stream()
                        .map(id -> new ConversationMemberId(conversationId, id))
                        .toList()
            );
        }

        if (!addMemberIds.isEmpty()) {
            conversationMemberRepository.saveAll(
                findUsersOrThrow(addMemberIds).stream()
                        .map(user -> new ConversationMember(conversation, user, MemberRole.MEMBER))
                        .toList()
            );
        }

        ensureGroupHasAdmin(conversationId);
    }

    private void ensureGroupHasAdmin(Long conversationId) {
        List<ConversationMember> members = getMemberById(conversationId);
        boolean hasAdmin = members.stream().anyMatch(m -> MemberRole.ADMIN.equals(m.getRole()));
        if (!hasAdmin && !members.isEmpty()) {
            ConversationMember first = members.get(0);
            first.setRole(MemberRole.ADMIN);
            conversationMemberRepository.save(first);
        }
    }

    private String normalizeText(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}