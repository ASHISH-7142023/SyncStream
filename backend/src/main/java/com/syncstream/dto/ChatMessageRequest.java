package com.syncstream.dto;

import lombok.Data;

@Data
/**
 * Payload for sending a new chat message to a room.
 */
public class ChatMessageRequest {
    private String content;
    private String clientMessageId;
    private String parentId;
    private boolean isVanishMode;
    
    private String messageType;
    private String attachmentId;
    private String fileName;
    private Long fileSize;
    private String fileType;
    
    private com.syncstream.model.PollData pollData;
    private com.syncstream.model.GameData gameData;
}

