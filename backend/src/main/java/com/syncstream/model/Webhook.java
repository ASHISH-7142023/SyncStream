package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "webhooks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Webhook {
    @Id
    private String id;
    
    @Indexed
    private String roomId;
    
    @Indexed(unique = true)
    private String token;
    
    private String name;
    private String avatarUrl;
    private String creatorId;
    
    private Instant createdAt;
}
