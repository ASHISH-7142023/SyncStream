package com.syncstream.controller;

import com.syncstream.service.WebPushService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
public class WebPushController {

    @Autowired
    private WebPushService webPushService;

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", webPushService.getPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, Object> subscription, Authentication auth) {
        String userId = auth.getName();
        
        String endpoint = (String) subscription.get("endpoint");
        Map<String, String> keys = (Map<String, String>) subscription.get("keys");
        String p256dh = keys != null ? keys.get("p256dh") : null;
        String authKey = keys != null ? keys.get("auth") : null;
        
        if (endpoint != null && p256dh != null && authKey != null) {
            webPushService.saveSubscription(userId, endpoint, p256dh, authKey);
            return ResponseEntity.ok(Map.of("status", "subscribed"));
        }
        return ResponseEntity.badRequest().body("Invalid subscription object");
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> request) {
        String endpoint = request.get("endpoint");
        if (endpoint != null) {
            webPushService.removeSubscription(endpoint);
        }
        return ResponseEntity.ok(Map.of("status", "unsubscribed"));
    }
}
