package com.syncstream.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebRtcSignalDto {
    private String type; // e.g., "offer", "answer", "candidate", "join", "leave"
    private String roomId;
    private String senderId;
    private String senderUsername;
    private String targetId; // null if broadcasting to room
    private Object sdp;
    private Object candidate;
}
