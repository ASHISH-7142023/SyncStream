package com.syncstream.dto;

import lombok.Data;

@Data
/**
 * Payload for user profile update operations.
 */
public class UpdateProfileRequest {
    private String bio;
    private String statusEmoji;
    private String customStatusText;
    private String themeColor;
    private String avatar;
    private java.util.List<String> badges;
}

