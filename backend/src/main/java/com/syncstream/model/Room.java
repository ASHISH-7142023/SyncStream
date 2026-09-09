package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    @Builder.Default
    private boolean isDirectMessage = false;

    private String ownerId;

    @Builder.Default
    private Set<String> members = new HashSet<>();

    @Builder.Default
    private Set<String> admins = new HashSet<>();

    @Builder.Default
    private Set<String> moderators = new HashSet<>();

    @Builder.Default
    private Set<String> bannedUsers = new HashSet<>();

    private Instant createdAt;
}
