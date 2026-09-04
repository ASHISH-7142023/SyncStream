package com.syncstream.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String content;
    private String clientMessageId;
    private String parentId;
    
    private String messageType;
    private String attachmentId;
    private String fileName;
    private Long fileSize;
    private String fileType;
}
