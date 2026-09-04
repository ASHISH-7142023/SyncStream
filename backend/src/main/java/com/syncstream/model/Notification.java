package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String userId; // the recipient
    private String title;
    private String message;
    private String type; // MENTION, DIRECT_MESSAGE, SYSTEM
    
    private String referenceId; // e.g. roomId or messageId
    
    @Builder.Default
    private boolean read = false;
    
    @Builder.Default
    private Instant createdAt = Instant.now();
}
