package com.syncstream.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Safe representation of a user sent to clients (excludes sensitive info like passwords).
 */
public class UserDto {
    private String id;
    private String username;
    private String gender;
    private String avatar;
    private Instant createdAt;
    private String themeColor;
    private String customStatusText;
    private String bio;
    private String statusEmoji;
    private java.util.List<String> badges;
}

