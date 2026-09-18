package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

    @Builder.Default
    private boolean isVoiceChannel = false;

    private String ownerId;

    @Builder.Default
    private Set<String> members = new HashSet<>();

    @Builder.Default
    private Set<String> admins = new HashSet<>();

    @Builder.Default
    private Set<String> moderators = new HashSet<>();

    @Builder.Default
    private Set<String> bannedUsers = new HashSet<>();

    @Builder.Default
    private List<CustomRole> customRoles = new ArrayList<>();

    @Builder.Default
    private Map<String, String> memberRoles = new HashMap<>();

    private Instant createdAt;
}
