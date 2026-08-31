package com.syncstream.controller;

import com.syncstream.dto.AuthResponse;
import com.syncstream.dto.LoginRequest;
import com.syncstream.dto.RegisterRequest;
import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import com.syncstream.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Username is already taken!");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .createdAt(Instant.now())
                .gender(registerRequest.getGender())
                .avatar(registerRequest.getAvatar())
                .build();

        userRepository.save(user);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getUsername(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername(), user.getGender(), user.getAvatar()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername(), user.getGender(), user.getAvatar()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("createdAt", user.getCreatedAt());
        response.put("gender", user.getGender());
        response.put("avatar", user.getAvatar());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String gender = request.get("gender");
        String avatar = request.get("avatar");

        if (gender != null) user.setGender(gender);
        if (avatar != null) user.setAvatar(avatar);

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("gender", user.getGender());
        response.put("avatar", user.getAvatar());

        return ResponseEntity.ok(response);
    }
}
