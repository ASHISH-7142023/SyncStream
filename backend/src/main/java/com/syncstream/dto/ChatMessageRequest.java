package com.syncstream.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String content;
    private String clientMessageId;
    private String parentId;
}
