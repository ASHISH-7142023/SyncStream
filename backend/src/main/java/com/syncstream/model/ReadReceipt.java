package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "read_receipts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "room_user_idx", def = "{'roomId': 1, 'userId': 1}", unique = true),
    @CompoundIndex(name = "room_msg_idx", def = "{'roomId': 1, 'messageId': 1}")
})
public class ReadReceipt {
    @Id
    private String id;
    
    private String roomId;
    private String userId;
    private String username;
    private String messageId;
    private Instant timestamp;
}
