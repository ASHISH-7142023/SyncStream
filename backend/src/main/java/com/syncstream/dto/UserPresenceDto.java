package com.syncstream.dto;

import com.syncstream.model.PresenceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPresenceDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String userId;
    private String username;
    private String serverId;
    private PresenceStatus status;
    private Instant lastSeen;
}
