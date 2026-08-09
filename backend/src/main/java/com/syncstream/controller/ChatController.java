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
                MessageType.TEXT
        );

        // Include clientMessageId in the Redis broadcast if needed by the client
        // To simplify, we can wrap the message or just send it with an extra property.
        // Let's add clientMessageId as an header or keep the DTO clean. 
        // We can just broadcast the savedMessage. 
        
        // Publish to Redis Pub/Sub topic to sync across multiple servers
        redisMessagePublisher.publish("syncstream:room:" + roomId, savedMessage);
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

    private User getUserFromPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            return (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        }
        return null;
    }
}
