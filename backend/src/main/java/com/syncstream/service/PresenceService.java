package com.syncstream.service;

import com.syncstream.dto.UserPresenceDto;
import com.syncstream.model.PresenceStatus;
import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PresenceService {

    private final String serverId = UUID.randomUUID().toString();
    private static final String PRESENCE_KEY_PREFIX = "syncstream:presence:";
    private static final long TTL_SECONDS = 60; // 60s presence timeout

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private UserRepository userRepository;

    public UserPresenceDto updateUserStatus(String userId, PresenceStatus status) {
        User user = userRepository.findById(userId).orElse(null);
        String username = user != null ? user.getUsername() : "Unknown";
        String avatar = user != null ? user.getAvatar() : null;

        UserPresenceDto presence = UserPresenceDto.builder()
                .userId(userId)
                .username(username)
                .avatar(avatar)
                .serverId(serverId)
                .status(status)
                .lastSeen(Instant.now())
                .build();

        String key = PRESENCE_KEY_PREFIX + userId;
        if (status == PresenceStatus.OFFLINE) {
            redisTemplate.delete(key);
        } else {
            redisTemplate.opsForValue().set(key, presence, TTL_SECONDS, TimeUnit.SECONDS);
        }

        return presence;
    }

    public UserPresenceDto getUserPresence(String userId) {
        String key = PRESENCE_KEY_PREFIX + userId;
        UserPresenceDto presence = (UserPresenceDto) redisTemplate.opsForValue().get(key);
        if (presence == null) {
            User user = userRepository.findById(userId).orElse(null);
            String username = user != null ? user.getUsername() : "Unknown";
            String avatar = user != null ? user.getAvatar() : null;
            
            return UserPresenceDto.builder()
                    .userId(userId)
                    .username(username)
                    .avatar(avatar)
                    .serverId(null)
                    .status(PresenceStatus.OFFLINE)
                    .lastSeen(Instant.EPOCH)
                    .build();
        }
        return presence;
    }

    public void heartbeat(String userId) {
        String key = PRESENCE_KEY_PREFIX + userId;
        redisTemplate.expire(key, TTL_SECONDS, TimeUnit.SECONDS);
    }
    
    public String getServerId() {
        return this.serverId;
    }
}
