package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "custom_emojis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomEmoji {

    @Id
    private String id;

    @Indexed(unique = true)
    private String shortcut; // e.g., "pepe_happy" without colons

    private String imageUrl;

    private String uploaderId;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
