package com.syncstream.controller;

import com.syncstream.model.Message;
import com.syncstream.model.User;
import com.syncstream.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/search")
    public ResponseEntity<Page<Message>> searchGlobalMessages(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Page<Message> results = messageService.searchGlobalMessages(query, user.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(results);
    }
}
