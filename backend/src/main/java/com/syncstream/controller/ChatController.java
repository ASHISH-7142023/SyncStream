package com.syncstream.controller;

import com.syncstream.dto.ChatMessageRequest;
import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.User;
import com.syncstream.pubsub.RedisMessagePublisher;
import com.syncstream.service.MessageService;
import com.syncstream.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
@Slf4j
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private RedisMessagePublisher redisMessagePublisher;

    @MessageMapping("/rooms/{roomId}/message")
    public void handleRoomMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageRequest request,
            Principal principal) {
        
        User user = getUserFromPrincipal(principal);
        if (user == null) {
            log.warn("Unauthorized message attempt in room: {}", roomId);
            return;
        }

        // Authorize: check if user is a member of the room
        if (!roomService.isMember(roomId, user.getId())) {
            log.warn("User {} is not authorized to send messages to room {}", user.getUsername(), roomId);
            return;
        }

        // Persist message to MongoDB
        Message savedMessage = messageService.saveMessage(
                roomId,
                user.getId(),
                request.getContent(),
                MessageType.TEXT,
                request.getParentId()
        );

        // Include clientMessageId if needed, but here we just broadcast
        redisMessagePublisher.publish("syncstream:room:" + roomId, savedMessage);
    }

    @MessageMapping("/rooms/{roomId}/reactions")
    public void handleReaction(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        
        User user = getUserFromPrincipal(principal);
        if (user == null || !roomService.isMember(roomId, user.getId())) {
            return;
        }

        String messageId = (String) payload.get("messageId");
        String emoji = (String) payload.get("emoji");
        Boolean active = (Boolean) payload.get("active");

        if (messageId == null || emoji == null || active == null) {
            return;
        }

        Message updatedMessage;
        if (active) {
            updatedMessage = messageService.addReaction(messageId, emoji, user.getUsername());
        } else {
            updatedMessage = messageService.removeReaction(messageId, emoji, user.getUsername());
        }

        // We can publish the updated message, or a special reaction event. Let's just publish the updated message.
        // It will have the same sequenceNumber, so clients can just replace it or merge it.
        // But to differentiate, maybe publish to a different channel, or just use the same channel and let the client handle updates.
        // Publishing the updated message on the same channel works if the client merges by ID.
        redisMessagePublisher.publish("syncstream:room:" + roomId, updatedMessage);
    }

    @MessageMapping("/rooms/{roomId}/typing")
    public void handleTypingEvent(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        
        User user = getUserFromPrincipal(principal);
        if (user == null) {
            return;
        }

        if (!roomService.isMember(roomId, user.getId())) {
            return;
        }

        Boolean isTyping = (Boolean) payload.get("isTyping");
        if (isTyping == null) {
            return;
        }

        Map<String, Object> typingEvent = new HashMap<>();
        typingEvent.put("roomId", roomId);
        typingEvent.put("userId", user.getId());
        typingEvent.put("username", user.getUsername());
        typingEvent.put("isTyping", isTyping);

        // Publish typing status to Redis
        redisMessagePublisher.publish("syncstream:typing:" + roomId, typingEvent);
    }

    @MessageMapping("/rooms/{roomId}/webrtc")
    public void handleWebRtcSignaling(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        
        User user = getUserFromPrincipal(principal);
        if (user == null || !roomService.isMember(roomId, user.getId())) {
            return;
        }

        // Add the senderId automatically to prevent spoofing
        payload.put("senderId", user.getId());
        payload.put("senderName", user.getUsername());
        payload.put("roomId", roomId);

        // Publish to Redis
        redisMessagePublisher.publish("syncstream:webrtc", payload);
    }

    private User getUserFromPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            return (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        }
        return null;
    }
}
