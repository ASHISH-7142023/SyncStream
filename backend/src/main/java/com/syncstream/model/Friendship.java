package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "friendships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {
    @Id
    private String id;
    
    private String requesterId;
    private String receiverId;
    
    @Builder.Default
    private FriendshipStatus status = FriendshipStatus.PENDING;
    
    private Instant createdAt;
    private Instant updatedAt;
}
