package com.syncstream.service;

import com.syncstream.dto.ChatMessageRequest;
import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.User;
import com.syncstream.repository.MessageRepository;
import com.syncstream.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private NotificationService notificationService;

    public Message saveMessage(String roomId, String senderId, ChatMessageRequest request) {
        String senderName = userRepository.findById(senderId)
                .map(User::getUsername)
                .orElse("Unknown");

        Long sequenceNumber = getNextSequenceNumber(roomId);

        MessageType type = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                type = MessageType.valueOf(request.getMessageType().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Message message = Message.builder()
                .roomId(roomId)
                .senderId(senderId)
                .senderName(senderName)
                .content(request.getContent())
                .messageType(type)
                .createdAt(Instant.now())
                .sequenceNumber(sequenceNumber)
                .parentId(request.getParentId())
                .attachmentId(request.getAttachmentId())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .fileType(request.getFileType())
                .pinned(false)
                .reactions(new java.util.HashMap<>())
                .build();

        Message savedMessage = messageRepository.save(message);

        // Parse mentions
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("@([a-zA-Z0-9_]+)").matcher(request.getContent());
            while (matcher.find()) {
                String mentionedUsername = matcher.group(1);
                userRepository.findByUsername(mentionedUsername).ifPresent(mentionedUser -> {
                    if (!mentionedUser.getId().equals(senderId)) {
                        notificationService.createNotification(
                                mentionedUser.getId(),
                                "New Mention",
                                senderName + " mentioned you in a message.",
                                "MENTION",
                                roomId
                        );
                    }
                });
            }
        }

        return savedMessage;
    }

    public Page<Message> getRoomMessages(String roomId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sequenceNumber"));
        return messageRepository.findByRoomId(roomId, pageRequest);
    }

    public List<Message> getMessagesAfter(String roomId, Long sequenceNumber) {
        return messageRepository.findByRoomIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(roomId, sequenceNumber);
    }

    private synchronized Long getNextSequenceNumber(String roomId) {
        String key = "syncstream:room:" + roomId + ":seq";
        Long seq = redisTemplate.opsForValue().increment(key);
        
        if (seq == null || seq == 1) {
            PageRequest pageRequest = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "sequenceNumber"));
            Page<Message> lastMessagePage = messageRepository.findByRoomId(roomId, pageRequest);
            if (lastMessagePage.hasContent()) {
                Long maxDbSeq = lastMessagePage.getContent().get(0).getSequenceNumber();
                if (maxDbSeq >= (seq != null ? seq : 0)) {
                    seq = maxDbSeq + 1;
                    redisTemplate.opsForValue().set(key, seq);
                }
            }
        }
        return seq;
    }

    public List<Message> getReplies(String messageId) {
        return messageRepository.findByParentIdOrderByCreatedAtAsc(messageId);
    }

    public Message addReaction(String messageId, String emoji, String username) {
        return messageRepository.findById(messageId).map(message -> {
            java.util.Map<String, List<String>> reactions = message.getReactions();
            if (reactions == null) {
                reactions = new java.util.HashMap<>();
            }
            List<String> users = reactions.getOrDefault(emoji, new java.util.ArrayList<>());
            if (!users.contains(username)) {
                users.add(username);
                reactions.put(emoji, users);
                message.setReactions(reactions);
                return messageRepository.save(message);
            }
            return message;
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    public Message removeReaction(String messageId, String emoji, String username) {
        return messageRepository.findById(messageId).map(message -> {
            java.util.Map<String, List<String>> reactions = message.getReactions();
            if (reactions != null && reactions.containsKey(emoji)) {
                List<String> users = reactions.get(emoji);
                if (users.remove(username)) {
                    if (users.isEmpty()) {
                        reactions.remove(emoji);
                    } else {
                        reactions.put(emoji, users);
                    }
                    message.setReactions(reactions);
                    return messageRepository.save(message);
                }
            }
            return message;
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    public Page<Message> searchMessages(String roomId, String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return messageRepository.searchMessagesInRoom(roomId, keyword, pageRequest);
    }

    public List<Message> getPinnedMessages(String roomId) {
        return messageRepository.findByRoomIdAndPinnedTrueOrderByCreatedAtDesc(roomId);
    }

    public Message togglePin(String messageId, boolean pinned) {
        return messageRepository.findById(messageId).map(message -> {
            message.setPinned(pinned);
            return messageRepository.save(message);
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }
}
