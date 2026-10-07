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
 * DTO for sending message read receipts via WebSocket.
 */
public class ReadReceiptDto {
    private String roomId;
    private String userId;
    private String username;
    private String messageId;
    private Instant timestamp;
}

