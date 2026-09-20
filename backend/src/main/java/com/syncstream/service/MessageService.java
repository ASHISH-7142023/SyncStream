package com.syncstream.service;

import com.syncstream.dto.ChatMessageRequest;
import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.User;
import com.syncstream.repository.MessageRepository;
import com.syncstream.repository.RoomRepository;
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
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private LinkPreviewService linkPreviewService;

    public Message saveMessage(String roomId, String senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId).orElse(null);
        String senderName = sender != null ? sender.getUsername() : "Unknown";
        String senderAvatar = sender != null ? sender.getAvatar() : null;

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
                .isVanishMode(request.isVanishMode())
                .createdAt(Instant.now())
                .sequenceNumber(sequenceNumber)
                .parentId(request.getParentId())
                .clientMessageId(request.getClientMessageId())
                .attachmentId(request.getAttachmentId())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .fileType(request.getFileType())
                .pinned(false)
                .reactions(new java.util.HashMap<>())
                .pollData(request.getPollData())
                .gameData(request.getGameData())
                .build();

        Message savedMessage = messageRepository.save(message);

        // Update thread metadata if this is a reply
        if (request.getParentId() != null) {
            messageRepository.findById(request.getParentId()).ifPresent(parentMsg -> {
                int count = parentMsg.getReplyCount() == null ? 0 : parentMsg.getReplyCount();
                parentMsg.setReplyCount(count + 1);
                parentMsg.setLastReplyAt(savedMessage.getCreatedAt());
                Message savedParent = messageRepository.save(parentMsg);
                
                // Broadcast updated parent message
                try {
                    String jsonMessage = objectMapper.writeValueAsString(savedParent);
                    redisTemplate.convertAndSend("syncstream:room:" + roomId, jsonMessage);
                } catch (Exception e) {
                    // Ignore parsing error
                }
            });
        }

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
                                roomId,
                                senderAvatar
                        );
                    }
                });
            }
        }

        // Trigger async link preview generation
        linkPreviewService.generatePreviewsAsync(savedMessage);

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

    public Page<Message> searchGlobalMessages(String keyword, String userId, PageRequest pageRequest) {
        List<String> roomIds = roomRepository.findByMembersContaining(userId).stream()
                .map(com.syncstream.model.Room::getId)
                .collect(java.util.stream.Collectors.toList());
        
        System.out.println("Searching global messages. Keyword: " + keyword + ", UserId: " + userId + ", RoomIds: " + roomIds);
        
        if (roomIds.isEmpty()) {
            return Page.empty(pageRequest);
        }
        
        // Use text search query across all authorized rooms, sorted by score/createdAt
        Page<Message> results = messageRepository.searchMessagesInRooms(roomIds, keyword, pageRequest);
        System.out.println("Search results count: " + results.getTotalElements());
        return results;
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

    public Message editMessage(String messageId, String newContent, String userId) {
        return messageRepository.findById(messageId).map(message -> {
            if (!message.getSenderId().equals(userId)) {
                throw new SecurityException("Not authorized to edit this message");
            }
            if (message.isDeleted()) {
                throw new IllegalStateException("Cannot edit a deleted message");
            }
            message.setContent(newContent);
            message.setEditedAt(Instant.now());
            return messageRepository.save(message);
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    public Message deleteMessage(String messageId, String userId) {
        return messageRepository.findById(messageId).map(message -> {
            boolean isAuthor = message.getSenderId().equals(userId);
            boolean isAuthorized = isAuthor;

            if (!isAuthor) {
                com.syncstream.model.Room room = roomRepository.findById(message.getRoomId()).orElse(null);
                if (room != null) {
                    boolean isOwner = room.getOwnerId().equals(userId);
                    boolean isAdmin = room.getAdmins() != null && room.getAdmins().contains(userId);
                    boolean isModerator = room.getModerators() != null && room.getModerators().contains(userId);
                    if (isOwner || isAdmin || isModerator) {
                        isAuthorized = true;
                    }
                }
            }

            if (!isAuthorized) {
                throw new SecurityException("Not authorized to delete this message");
            }
            message.setDeleted(true);
            message.setContent(""); // Clear content
            message.setAttachmentId(null); // Clear attachments
            message.setFileName(null);
            message.setReactions(new java.util.HashMap<>()); // Clear reactions
            return messageRepository.save(message);
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    public Message votePoll(String messageId, int optionIndex, String userId) {
        return messageRepository.findById(messageId).map(message -> {
            if (message.getMessageType() != MessageType.POLL || message.getPollData() == null) {
                throw new IllegalArgumentException("Message is not a poll");
            }
            
            com.syncstream.model.PollData pollData = message.getPollData();
            if (optionIndex < 0 || optionIndex >= pollData.getOptions().size()) {
                throw new IllegalArgumentException("Invalid option index");
            }

            java.util.Map<Integer, List<String>> votes = pollData.getVotes();
            if (votes == null) {
                votes = new java.util.HashMap<>();
                pollData.setVotes(votes);
            }

            // If not multiple choice, remove the user's vote from any other option first
            if (!pollData.isMultipleChoice()) {
                for (java.util.Map.Entry<Integer, List<String>> entry : votes.entrySet()) {
                    if (entry.getKey() != optionIndex) {
                        entry.getValue().remove(userId);
                    }
                }
            }

            // Toggle the vote for this option
            List<String> optionVotes = votes.getOrDefault(optionIndex, new java.util.ArrayList<>());
            if (optionVotes.contains(userId)) {
                optionVotes.remove(userId);
            } else {
                optionVotes.add(userId);
            }
            votes.put(optionIndex, optionVotes);

            return messageRepository.save(message);
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }
    public Message processGameMove(String messageId, int cellIndex, String userId, String username) {
        return messageRepository.findById(messageId).map(message -> {
            if (message.getMessageType() != MessageType.GAME_TICTACTOE || message.getGameData() == null) {
                throw new IllegalArgumentException("Message is not a Tic-Tac-Toe game");
            }

            com.syncstream.model.GameData game = message.getGameData();

            if (game.isGameOver()) {
                throw new IllegalStateException("Game is already over");
            }

            // Assign players if spots are open
            if (game.getPlayer1Id() == null) {
                game.setPlayer1Id(userId);
                game.setPlayer1Name(username);
                game.setCurrentTurnId(userId); // Player 1 starts
            } else if (game.getPlayer2Id() == null && !userId.equals(game.getPlayer1Id())) {
                game.setPlayer2Id(userId);
                game.setPlayer2Name(username);
            }

            // Check if user is a player
            if (!userId.equals(game.getPlayer1Id()) && !userId.equals(game.getPlayer2Id())) {
                throw new SecurityException("You are not a player in this game");
            }

            // Check turn
            if (!userId.equals(game.getCurrentTurnId())) {
                throw new IllegalStateException("Not your turn");
            }

            // Validate move
            if (cellIndex < 0 || cellIndex > 8 || game.getBoard().get(cellIndex) != null) {
                throw new IllegalArgumentException("Invalid move");
            }

            String symbol = userId.equals(game.getPlayer1Id()) ? "X" : "O";
            game.getBoard().set(cellIndex, symbol);

            // Check win/draw
            String winner = checkTicTacToeWinner(game.getBoard());
            if (winner != null) {
                game.setGameOver(true);
                if (winner.equals("DRAW")) {
                    game.setWinnerId("DRAW");
                } else {
                    game.setWinnerId(winner.equals("X") ? game.getPlayer1Id() : game.getPlayer2Id());
                }
            } else {
                // Switch turn
                game.setCurrentTurnId(userId.equals(game.getPlayer1Id()) ? game.getPlayer2Id() : game.getPlayer1Id());
            }

            return messageRepository.save(message);
        }).orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    private String checkTicTacToeWinner(List<String> board) {
        int[][] lines = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // rows
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // cols
            {0, 4, 8}, {2, 4, 6}             // diagonals
        };
        for (int[] line : lines) {
            String a = board.get(line[0]);
            String b = board.get(line[1]);
            String c = board.get(line[2]);
            if (a != null && a.equals(b) && a.equals(c)) {
                return a;
            }
        }
        boolean isDraw = true;
        for (String cell : board) {
            if (cell == null) {
                isDraw = false;
                break;
            }
        }
        return isDraw ? "DRAW" : null;
    }
}
