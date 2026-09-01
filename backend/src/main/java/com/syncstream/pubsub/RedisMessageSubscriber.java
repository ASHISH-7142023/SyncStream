package com.syncstream.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncstream.dto.UserPresenceDto;
import com.syncstream.model.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.List;
import com.syncstream.model.Room;
import com.syncstream.service.RoomService;

@Service
@Slf4j
public class RedisMessageSubscriber {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoomService roomService;

    public void handleRoomMessage(String message) {
        log.info("Received room message from Redis Pub/Sub: {}", message);
        try {
            Message chatMessage = objectMapper.readValue(message, Message.class);
            // Broadcast to STOMP clients subscribed to /topic/rooms/{roomId}
            messagingTemplate.convertAndSend("/topic/rooms/" + chatMessage.getRoomId(), chatMessage);
            
            // Broadcast push notifications
            if (chatMessage.getMessageType().equals("TEXT")) {
                roomService.getRoomById(chatMessage.getRoomId()).ifPresent(room -> {
                    for (String memberId : room.getMembers()) {
                        if (!memberId.equals(chatMessage.getSenderId())) {
                            messagingTemplate.convertAndSend("/topic/user." + memberId + ".notifications", chatMessage);
                        }
                    }
                });
            }
        } catch (IOException e) {
            log.error("Failed to deserialize room message", e);
        }
    }

    public void handleTypingMessage(String message) {
        log.info("Received typing message from Redis Pub/Sub: {}", message);
        try {
            Map<?, ?> typingMap = objectMapper.readValue(message, Map.class);
            String roomId = (String) typingMap.get("roomId");
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/typing", typingMap);
        } catch (IOException e) {
            log.error("Failed to deserialize typing message", e);
        }
    }

    public void handlePresenceMessage(String message) {
        log.info("Received presence message from Redis Pub/Sub: {}", message);
        try {
            UserPresenceDto presenceDto = objectMapper.readValue(message, UserPresenceDto.class);
            // Broadcast to global presence topic
            messagingTemplate.convertAndSend("/topic/presence", presenceDto);
        } catch (IOException e) {
            log.error("Failed to deserialize presence message", e);
        }
    }

    public void handleWebRtcMessage(String message) {
        log.info("Received WebRTC signaling message from Redis Pub/Sub");
        try {
            Map<?, ?> webrtcMap = objectMapper.readValue(message, Map.class);
            String targetId = (String) webrtcMap.get("targetId");
            if (targetId != null) {
                // Forward the WebRTC signal strictly to the target user
                messagingTemplate.convertAndSend("/topic/user." + targetId + ".webrtc", webrtcMap);
            }
        } catch (IOException e) {
            log.error("Failed to deserialize WebRTC message", e);
        }
    }
}
