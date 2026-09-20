package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameData {
    private String gameType; // e.g., "TICTACTOE"
    
    @Builder.Default
    private List<String> board = new ArrayList<>(); // 9 elements for Tic-Tac-Toe
    
    private String player1Id; // 'X'
    private String player1Name;
    
    private String player2Id; // 'O'
    private String player2Name;
    
    private String currentTurnId;
    private String winnerId; // null if no winner, "DRAW" if draw, else userId
    private boolean isGameOver;
}
