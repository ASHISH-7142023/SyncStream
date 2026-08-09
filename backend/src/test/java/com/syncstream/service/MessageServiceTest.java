package com.syncstream.service;

import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.User;
import com.syncstream.repository.MessageRepository;
import com.syncstream.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private MessageService messageService;

    @Test
    void testSaveMessage() {
        User sender = User.builder().id("user-1").username("Ashish").build();
        Message mockSaved = Message.builder()
                .roomId("room-1")
                .senderId("user-1")
                .senderName("Ashish")
                .content("Hello World")
                .messageType(MessageType.TEXT)
                .sequenceNumber(5L)
                .build();

        when(userRepository.findById("user-1")).thenReturn(Optional.of(sender));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(5L);
        when(messageRepository.save(any(Message.class))).thenReturn(mockSaved);

        Message saved = messageService.saveMessage("room-1", "user-1", "Hello World", MessageType.TEXT);

        assertNotNull(saved);
        assertEquals(5L, saved.getSequenceNumber());
        assertEquals("Ashish", saved.getSenderName());
        verify(messageRepository, times(1)).save(any(Message.class));
    }
}
