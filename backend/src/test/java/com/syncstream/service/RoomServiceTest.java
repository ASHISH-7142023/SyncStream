package com.syncstream.service;

import com.syncstream.model.Room;
import com.syncstream.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    private Room mockRoom;

    @BeforeEach
    void setUp() {
        mockRoom = Room.builder()
                .id("room-123")
                .name("developers")
                .description("Dev room")
                .ownerId("user-1")
                .build();
    }

    @Test
    void testCreateRoom() {
        when(roomRepository.existsByName("developers")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(mockRoom);

        Room created = roomService.createRoom("developers", "Dev room", "user-1");

        assertNotNull(created);
        assertEquals("developers", created.getName());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void testDeleteRoom_Success() {
        when(roomRepository.findById("room-123")).thenReturn(Optional.of(mockRoom));

        roomService.deleteRoom("room-123", "user-1");

        verify(roomRepository, times(1)).delete(mockRoom);
    }

    @Test
    void testDeleteRoom_Forbidden() {
        when(roomRepository.findById("room-123")).thenReturn(Optional.of(mockRoom));

        assertThrows(SecurityException.class, () -> {
            roomService.deleteRoom("room-123", "user-2");
        });

        verify(roomRepository, never()).delete(any(Room.class));
    }
}
