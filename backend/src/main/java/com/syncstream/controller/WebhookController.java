package com.syncstream.controller;

import com.syncstream.dto.ChatMessageRequest;
import com.syncstream.model.Webhook;
import com.syncstream.repository.RoomRepository;
import com.syncstream.repository.WebhookRepository;
import com.syncstream.model.User;
import com.syncstream.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class WebhookController {

    @Autowired
    private WebhookRepository webhookRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MessageService messageService;

    // --- Webhook Management (Requires Authentication) ---

    @GetMapping("/rooms/{roomId}/webhooks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Webhook>> getWebhooks(@PathVariable String roomId, @AuthenticationPrincipal User currentUser) {
        // Here we could check if user is an admin/has MANAGE_WEBHOOKS permission
        return ResponseEntity.ok(webhookRepository.findByRoomId(roomId));
    }

    @PostMapping("/rooms/{roomId}/webhooks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createWebhook(@PathVariable String roomId, @RequestBody Map<String, String> request, @AuthenticationPrincipal User currentUser) {
        String name = request.getOrDefault("name", "Incoming Webhook");
        
        Webhook webhook = Webhook.builder()
                .roomId(roomId)
                .name(name)
                .token(UUID.randomUUID().toString())
                .creatorId(currentUser.getId())
                .createdAt(Instant.now())
                .build();
                
        Webhook saved = webhookRepository.save(webhook);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/rooms/{roomId}/webhooks/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteWebhook(@PathVariable String roomId, @PathVariable String id, @AuthenticationPrincipal User currentUser) {
        webhookRepository.findById(id).ifPresent(webhook -> {
            if (webhook.getRoomId().equals(roomId)) {
                webhookRepository.delete(webhook);
            }
        });
        return ResponseEntity.noContent().build();
    }

    // --- Public Webhook Payload Receiver (No Authentication) ---

    @PostMapping("/webhooks/{token}")
    public ResponseEntity<?> receiveWebhookPayload(@PathVariable String token, @RequestBody Map<String, Object> payload) {
        return webhookRepository.findByToken(token).map(webhook -> {
            String roomId = webhook.getRoomId();
            
            // Basic generic payload parser. 
            // In a real scenario, this would detect GitHub/Jira payloads based on headers.
            String messageContent = "Received webhook payload from " + webhook.getName();
            
            if (payload.containsKey("content")) {
                messageContent = payload.get("content").toString();
            } else if (payload.containsKey("action")) {
                // e.g. GitHub Issues payload
                messageContent = "Action: " + payload.get("action");
            }
            
            // Format as a bot message. Since we need a senderId, we can use the Webhook's ID or creatorId.
            // Using creatorId so the system accepts it, or a special "SYSTEM" user.
            // Let's use the webhook's ID as the senderId for now, but prefix the content to show it's a bot.
            
            ChatMessageRequest messageRequest = new ChatMessageRequest();
            messageRequest.setContent("🤖 [" + webhook.getName() + "]: " + messageContent);
            
            messageService.saveMessage(roomId, webhook.getCreatorId(), messageRequest);
            
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
