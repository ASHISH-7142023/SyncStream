package com.syncstream.service;

import com.syncstream.model.Notification;
import com.syncstream.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private WebPushService webPushService;

    @Autowired
    private ObjectMapper objectMapper;

    public Notification createNotification(String userId, String title, String message, String type, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Publish to user's personal STOMP queue via Redis
        redisTemplate.convertAndSend("syncstream:user:" + userId + ":notifications", saved);
        
        // Trigger Web Push Notification
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body", message,
                    "url", "/rooms/" + referenceId
            ));
            webPushService.sendPushNotification(userId, payload);
        } catch (Exception e) {
            // Log error but don't fail standard notification
        }
        
        return saved;
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }
    
    public List<Notification> getAllNotifications(String userId) {
        return notificationRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
