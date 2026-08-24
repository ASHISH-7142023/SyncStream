package com.syncstream.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncstream.dto.UserPresenceDto;
import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.Room;
import com.syncstream.model.User;
import com.syncstream.service.MessageService;
import com.syncstream.service.PresenceService;
import com.syncstream.service.RoomService;
import com.syncstream.security.CustomUserDetailsService;
import com.syncstream.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.syncstream.config.SecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(RoomController.class)
@Import(SecurityConfig.class)
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomService roomService;

    @MockBean
    private MessageService messageService;

    @MockBean
    private PresenceService presenceService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private User mockUser;

    @BeforeEach
    public void setUp() {
        mockUser = User.builder()
                .id("user-123")
                .username("testuser")
                .build();
    }

    @Test
    public void testCreateRoom_Success() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("name", "general");
        request.put("description", "Public room");

        Room mockRoom = Room.builder()
                .id("room-123")
                .name("general")
                .description("Public room")
                .ownerId("user-123")
                .members(new HashSet<>(Collections.singletonList("user-123")))
                .createdAt(Instant.now())
                .build();

        when(roomService.createRoom(anyString(), anyString(), anyString())).thenReturn(mockRoom);

        mockMvc.perform(post("/api/rooms")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(user(mockUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("room-123"))
                .andExpect(jsonPath("$.name").value("general"))
                .andExpect(jsonPath("$.ownerId").value("user-123"));
    }

    @Test
    public void testCreateRoom_EmptyName() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("name", "");

        mockMvc.perform(post("/api/rooms")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(user(mockUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Room name cannot be empty"));
    }

    @Test
    public void testGetAllRooms() throws Exception {
        Room room1 = Room.builder().id("room-1").name("dev").build();
        Room room2 = Room.builder().id("room-2").name("design").build();
        List<Room> roomList = Arrays.asList(room1, room2);

        when(roomService.getAllRooms()).thenReturn(roomList);

        mockMvc.perform(get("/api/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(mockUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("dev"))
                .andExpect(jsonPath("$[1].name").value("design"));
    }

    @Test
    public void testGetRoomById_Success() throws Exception {
        Room mockRoom = Room.builder()
                .id("room-1")
                .name("dev")
                .members(new HashSet<>(Collections.singletonList("user-123")))
                .build();

        when(roomService.getRoomById("room-1")).thenReturn(Optional.of(mockRoom));

        mockMvc.perform(get("/api/rooms/room-1")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(mockUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("room-1"))
                .andExpect(jsonPath("$.name").value("dev"));
    }

    @Test
    public void testGetRoomById_Forbidden() throws Exception {
        // User not a member of the room
        Room mockRoom = Room.builder()
                .id("room-1")
                .name("dev")
                .members(new HashSet<>(Collections.singletonList("another-user")))
                .build();

        when(roomService.getRoomById("room-1")).thenReturn(Optional.of(mockRoom));

        mockMvc.perform(get("/api/rooms/room-1")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(mockUser)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You are not a member of this room"));
    }

    @Test
    public void testGetRoomPresence_Success() throws Exception {
        Room mockRoom = Room.builder()
                .id("room-1")
                .name("dev")
                .members(new HashSet<>(Arrays.asList("user-123", "user-456")))
                .build();

        UserPresenceDto presence1 = UserPresenceDto.builder()
                .userId("user-123")
                .username("testuser")
                .status(com.syncstream.model.PresenceStatus.ONLINE)
                .build();
        UserPresenceDto presence2 = UserPresenceDto.builder()
                .userId("user-456")
                .username("otheruser")
                .status(com.syncstream.model.PresenceStatus.OFFLINE)
                .build();

        when(roomService.isMember("room-1", "user-123")).thenReturn(true);
        when(roomService.getRoomById("room-1")).thenReturn(Optional.of(mockRoom));
        when(presenceService.getUserPresence("user-123")).thenReturn(presence1);
        when(presenceService.getUserPresence("user-456")).thenReturn(presence2);

        mockMvc.perform(get("/api/rooms/room-1/presence")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(mockUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user-123.status").value("ONLINE"))
                .andExpect(jsonPath("$.user-456.status").value("OFFLINE"));
    }

    @Test
    public void testGetRoomMessages_Success() throws Exception {
        Message msg1 = Message.builder()
                .id("msg-1")
                .roomId("room-1")
                .senderId("user-123")
                .content("hello")
                .messageType(MessageType.TEXT)
                .build();
        Page<Message> messagePage = new PageImpl<>(Collections.singletonList(msg1), PageRequest.of(0, 50), 1);

        when(roomService.isMember("room-1", "user-123")).thenReturn(true);
        when(messageService.getRoomMessages("room-1", 0, 50)).thenReturn(messagePage);

        mockMvc.perform(get("/api/rooms/room-1/messages")
                .param("page", "0")
                .param("size", "50")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(mockUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("msg-1"))
                .andExpect(jsonPath("$.content[0].content").value("hello"))
                .andExpect(jsonPath("$.last").value(true));
    }
}
