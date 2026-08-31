package com.syncstream.controller;

import com.syncstream.dto.UserDto;
import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        List<UserDto> userDtos = users.stream().map(u -> UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .avatar(u.getAvatar())
                .gender(u.getGender())
                .build()).collect(Collectors.toList());
                
        return ResponseEntity.ok(userDtos);
    }
}
