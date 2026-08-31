package com.syncstream.dto;

import com.syncstream.model.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipDto {
    private String id;
    private UserDto user; // The "other" user
    private FriendshipStatus status;
    private Instant createdAt;
}
