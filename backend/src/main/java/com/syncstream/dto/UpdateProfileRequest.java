package com.syncstream.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String bio;
    private String statusEmoji;
    private String customStatusText;
    private String themeColor;
    private String avatar;
}
