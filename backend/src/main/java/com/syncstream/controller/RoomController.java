package com.syncstream.controller;

import com.syncstream.model.Message;
import com.syncstream.model.Room;
import com.syncstream.model.User;
import com.syncstream.service.MessageService;
import com.syncstream.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private com.syncstream.service.PresenceService presenceService;

    @GetMapping("/{roomId}/presence")
    public ResponseEntity<?> getRoomPresence(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user) {
        
        if (!roomService.isMember(roomId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You must be a member of the room to view presence"));
        }

        return roomService.getRoomById(roomId)
                .map(room -> {
                    Map<String, com.syncstream.dto.UserPresenceDto> presenceMap = new HashMap<>();
                    for (String memberId : room.getMembers()) {
                        presenceMap.put(memberId, presenceService.getUserPresence(memberId));
                    }
                    return ResponseEntity.ok(presenceMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRoom(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        String name = request.get("name");
        String description = request.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Room name cannot be empty"));
        }

        try {
            Room room = roomService.createRoom(name.trim(), description, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoomById(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user) {
        return roomService.getRoomById(roomId)
                .map(room -> {
                    if (!room.getMembers().contains(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "You are not a member of this room"));
                    }
                    return ResponseEntity.ok(room);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user) {
        try {
            roomService.deleteRoom(roomId, user.getId());
            return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user) {
        try {
            Room room = roomService.joinRoom(roomId, user.getId());
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal User user) {
        try {
            Room room = roomService.leaveRoom(roomId, user.getId());
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal User user) {
        
        // Authorization check: User must be a member of the room
        if (!roomService.isMember(roomId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You must be a member of the room to view messages"));
        }

        Page<Message> messagePage = messageService.getRoomMessages(roomId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", messagePage.getContent());
        response.put("pageNumber", messagePage.getNumber());
        response.put("pageSize", messagePage.getSize());
        response.put("totalElements", messagePage.getTotalElements());
        response.put("totalPages", messagePage.getTotalPages());
        response.put("last", messagePage.isLast());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}/messages/after")
    public ResponseEntity<?> getMessagesAfter(
            @PathVariable String roomId,
            @RequestParam Long seq,
            @AuthenticationPrincipal User user) {
        
        if (!roomService.isMember(roomId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You must be a member of the room to view messages"));
        }

        return ResponseEntity.ok(messageService.getMessagesAfter(roomId, seq));
    }

    @GetMapping("/{roomId}/messages/{messageId}/replies")
    public ResponseEntity<?> getReplies(
            @PathVariable String roomId,
            @PathVariable String messageId,
            @AuthenticationPrincipal User user) {
        
        if (!roomService.isMember(roomId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You must be a member of the room to view replies"));
        }

        return ResponseEntity.ok(messageService.getReplies(messageId));
    }

    @PostMapping("/dm/{targetUserId}")
    public ResponseEntity<?> getOrCreateDirectMessage(
            @PathVariable String targetUserId,
            @AuthenticationPrincipal User user) {
        try {
            Room room = roomService.getOrCreateDirectMessageRoom(user.getId(), targetUserId);
            return ResponseEntity.ok(room);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
