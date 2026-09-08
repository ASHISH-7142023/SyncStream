package com.syncstream.controller;

import com.syncstream.model.User;
import com.syncstream.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/crypto")
public class CryptoController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users/{userId}/public-key")
    public ResponseEntity<?> getUserPublicKey(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        if (user.getPublicKey() == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // No keys yet
        }

        Map<String, String> response = new HashMap<>();
        response.put("publicKey", user.getPublicKey());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/keys")
    public ResponseEntity<?> setKeys(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String publicKey = request.get("publicKey");
        String encryptedPrivateKey = request.get("encryptedPrivateKey");

        if (publicKey == null || encryptedPrivateKey == null) {
            return ResponseEntity.badRequest().body("Both publicKey and encryptedPrivateKey are required");
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        user.setPublicKey(publicKey);
        user.setEncryptedPrivateKey(encryptedPrivateKey);
        userRepository.save(user);

        return ResponseEntity.ok("Keys updated successfully");
    }
}
