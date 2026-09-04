package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "room_created_at_idx", def = "{'roomId': 1, 'createdAt': 1}"),
    @CompoundIndex(name = "room_seq_idx", def = "{'roomId': 1, 'sequenceNumber': 1}")
})
public class Message {

    @Id
    private String id;

    @Indexed
    private String roomId;

    @Indexed
    private String senderId;

    private String senderName;

    @TextIndexed
    private String content;

    private MessageType messageType;

    private Instant createdAt;

    private Long sequenceNumber;

    private String parentId;

    private String attachmentId;

    private String fileName;

    private Long fileSize;

    private String fileType;

    private boolean pinned;

    private java.util.Map<String, java.util.List<String>> reactions = new java.util.HashMap<>();
}
