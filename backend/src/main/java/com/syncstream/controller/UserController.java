package com.syncstream.controller;

import com.syncstream.dto.UpdateProfileRequest;
import com.syncstream.dto.UserDto;
import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        List<UserDto> userDtos = users.stream().map(this::mapToDto).collect(Collectors.toList());
                
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getUser(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(mapToDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        
        return userRepository.findById(currentUser.getId()).map(user -> {
            if (request.getBio() != null) user.setBio(request.getBio());
            if (request.getStatusEmoji() != null) user.setStatusEmoji(request.getStatusEmoji());
            if (request.getCustomStatusText() != null) user.setCustomStatusText(request.getCustomStatusText());
            if (request.getThemeColor() != null) user.setThemeColor(request.getThemeColor());
            if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
            
            userRepository.save(user);
            return ResponseEntity.ok(mapToDto(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .gender(user.getGender())
                .createdAt(user.getCreatedAt())
                .themeColor(user.getThemeColor())
                .customStatusText(user.getCustomStatusText())
                .bio(user.getBio())
                .statusEmoji(user.getStatusEmoji())
                .build();
    }
}
