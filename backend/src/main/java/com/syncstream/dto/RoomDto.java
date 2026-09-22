package com.syncstream.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private String id;
    private String name;
    private String description;
    private boolean isDirectMessage;
    private boolean isVoiceChannel;
    private String ownerId;
    private Set<String> members;
    private Set<String> admins;
    private Set<String> bannedUsers;
    private Instant createdAt;
    
    private Map<String, String> userRoles; 
    
    private String otherUsername;
    private String otherUserAvatar;
    private String otherUserPublicKey;
}
