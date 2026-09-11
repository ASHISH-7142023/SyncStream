package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollData {
    private String question;
    
    @Builder.Default
    private List<String> options = new ArrayList<>();
    
    // Maps option index to a list of user IDs who voted for it
    @Builder.Default
    private Map<Integer, List<String>> votes = new HashMap<>();
    
    @Builder.Default
    private boolean multipleChoice = false;
}
