package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhiteboardAction {
    private String type; // DRAW, ERASE, CLEAR
    private double prevX;
    private double prevY;
    private double currentX;
    private double currentY;
    private String color;
    private double size;
    private String userId;
}
