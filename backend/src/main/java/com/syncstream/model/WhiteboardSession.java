package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "whiteboard_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhiteboardSession {

    @Id
    private String id;

    @Indexed(unique = true)
    private String roomId;

    @Builder.Default
    private List<WhiteboardAction> strokes = new ArrayList<>();
}
