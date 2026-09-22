package com.syncstream.service;

import com.syncstream.dto.UserPresenceDto;
import com.syncstream.model.PresenceStatus;
import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PresenceServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PresenceService presenceService;

    private User mockUser;
    private final String userId = "user-123";
    private final String presenceKey = "syncstream:presence:user-123";

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(userId)
                .username("test_user")
                .avatar("avatar.png")
                .customStatusText("Hello world")
                .build();
    }

    @Test
    void testUpdateUserStatus_Online() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(presenceKey)).thenReturn(null);

        UserPresenceDto result = presenceService.updateUserStatus(userId, PresenceStatus.ONLINE);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(PresenceStatus.ONLINE, result.getStatus());
        assertEquals("test_user", result.getUsername());
        
        verify(valueOperations).set(eq(presenceKey), any(UserPresenceDto.class), eq(60L), eq(TimeUnit.SECONDS));
    }

    @Test
    void testUpdateUserStatus_Offline() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(presenceKey)).thenReturn(null);

        UserPresenceDto result = presenceService.updateUserStatus(userId, PresenceStatus.OFFLINE);

        assertNotNull(result);
        assertEquals(PresenceStatus.OFFLINE, result.getStatus());
        
        verify(redisTemplate).delete(presenceKey);
        verify(valueOperations, never()).set(anyString(), any(), anyLong(), any());
    }

    @Test
    void testGetUserPresence_FromCache() {
        UserPresenceDto cachedPresence = UserPresenceDto.builder()
                .userId(userId)
                .status(PresenceStatus.ONLINE)
                .build();
                
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(presenceKey)).thenReturn(cachedPresence);

        UserPresenceDto result = presenceService.getUserPresence(userId);

        assertNotNull(result);
        assertEquals(PresenceStatus.ONLINE, result.getStatus());
        verify(userRepository, never()).findById(anyString());
    }

    @Test
    void testGetUserPresence_NotCached() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(presenceKey)).thenReturn(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        UserPresenceDto result = presenceService.getUserPresence(userId);

        assertNotNull(result);
        assertEquals(PresenceStatus.OFFLINE, result.getStatus());
        assertEquals("test_user", result.getUsername());
        assertEquals(Instant.EPOCH, result.getLastSeen());
    }

    @Test
    void testUpdateSpotifyPresence() {
        UserPresenceDto cachedPresence = UserPresenceDto.builder()
                .userId(userId)
                .status(PresenceStatus.ONLINE)
                .build();
                
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(presenceKey)).thenReturn(cachedPresence);

        UserPresenceDto result = presenceService.updateSpotifyPresence(
                userId, true, "track123", "Song Title", "Artist", "album.jpg");

        assertNotNull(result);
        assertTrue(result.isListening());
        assertEquals("track123", result.getSpotifyTrackId());
        assertEquals("Song Title", result.getSpotifyTrackName());
        
        verify(valueOperations).set(eq(presenceKey), eq(cachedPresence), eq(60L), eq(TimeUnit.SECONDS));
    }

    @Test
    void testHeartbeat() {
        presenceService.heartbeat(userId);
        verify(redisTemplate).expire(presenceKey, 60L, TimeUnit.SECONDS);
    }
}
