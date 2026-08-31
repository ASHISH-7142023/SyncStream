package com.syncstream.controller;

import com.syncstream.dto.FriendshipDto;
import com.syncstream.model.User;
import com.syncstream.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendRequest(@AuthenticationPrincipal User user, @PathVariable String receiverId) {
        return ResponseEntity.ok(friendshipService.sendRequest(user.getId(), receiverId));
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<?> acceptRequest(@AuthenticationPrincipal User user, @PathVariable String friendshipId) {
        return ResponseEntity.ok(friendshipService.acceptRequest(user.getId(), friendshipId));
    }

    @PostMapping("/decline/{friendshipId}")
    public ResponseEntity<?> declineRequest(@AuthenticationPrincipal User user, @PathVariable String friendshipId) {
        friendshipService.declineRequest(user.getId(), friendshipId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<FriendshipDto>> getFriends(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendshipService.getUserFriends(user.getId()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipDto>> getPendingRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendshipService.getPendingRequests(user.getId()));
    }
}
