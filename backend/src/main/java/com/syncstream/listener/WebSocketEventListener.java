package com.syncstream.listener;

import com.syncstream.dto.UserPresenceDto;
import com.syncstream.model.PresenceStatus;
import com.syncstream.model.User;
import com.syncstream.pubsub.RedisMessagePublisher;
import com.syncstream.service.PresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private PresenceService presenceService;

    @Autowired
    private RedisMessagePublisher redisMessagePublisher;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            User user = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            log.info("User connected via STOMP: {}", user.getUsername());
            
            UserPresenceDto presence = presenceService.updateUserStatus(user.getId(), PresenceStatus.ONLINE);
            redisMessagePublisher.publish("syncstream:presence", presence);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            User user = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            log.info("User disconnected from STOMP: {}", user.getUsername());
            
            UserPresenceDto presence = presenceService.updateUserStatus(user.getId(), PresenceStatus.OFFLINE);
            redisMessagePublisher.publish("syncstream:presence", presence);
        }
    }
}
