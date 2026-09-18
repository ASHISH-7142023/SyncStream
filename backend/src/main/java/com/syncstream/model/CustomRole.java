package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomRole {
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    
    private String name;
    private String color;
    
    @Builder.Default
    private Set<String> permissions = new HashSet<>();
}
