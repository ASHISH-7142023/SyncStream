package com.syncstream.controller;

import com.syncstream.model.CustomEmoji;
import com.syncstream.model.User;
import com.syncstream.repository.CustomEmojiRepository;
import com.syncstream.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/emojis")
@Slf4j
public class EmojiController {

    @Autowired
    private CustomEmojiRepository emojiRepository;

    @Autowired
    private FileService fileService;

    @GetMapping
    public ResponseEntity<List<CustomEmoji>> getAllEmojis() {
        return ResponseEntity.ok(emojiRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createEmoji(
            @RequestParam("shortcut") String shortcut,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        // Clean shortcut
        String cleanShortcut = shortcut.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();

        if (emojiRepository.existsByShortcut(cleanShortcut)) {
            return ResponseEntity.badRequest().body("Shortcut already exists");
        }

        try {
            String fileId = fileService.storeFile(file);
            String fileUrl = "/api/files/download/" + fileId;

            CustomEmoji emoji = CustomEmoji.builder()
                    .shortcut(cleanShortcut)
                    .imageUrl(fileUrl)
                    .uploaderId(user.getId())
                    .createdAt(Instant.now())
                    .build();

            CustomEmoji savedEmoji = emojiRepository.save(emoji);
            return ResponseEntity.ok(savedEmoji);

        } catch (Exception e) {
            log.error("Failed to create emoji", e);
            return ResponseEntity.internalServerError().body("Failed to upload emoji image");
        }
    }
}
