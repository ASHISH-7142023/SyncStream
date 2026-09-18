package com.syncstream.controller;

import com.syncstream.model.WhiteboardAction;
import com.syncstream.model.WhiteboardSession;
import com.syncstream.repository.WhiteboardSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms/{roomId}/whiteboard")
public class WhiteboardController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private WhiteboardSessionRepository whiteboardSessionRepository;

    @GetMapping
    public ResponseEntity<List<WhiteboardAction>> getWhiteboardSession(@PathVariable String roomId) {
        Optional<WhiteboardSession> sessionOpt = whiteboardSessionRepository.findByRoomId(roomId);
        if (sessionOpt.isPresent()) {
            return ResponseEntity.ok(sessionOpt.get().getStrokes());
        }
        return ResponseEntity.ok(new ArrayList<>());
    }

    @MessageMapping("/room/{roomId}/whiteboard")
    public void handleWhiteboardAction(@DestinationVariable String roomId, WhiteboardAction action) {
        // Broadcast the action immediately to clients
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".whiteboard", action);

        // Update the session in DB
        WhiteboardSession session = whiteboardSessionRepository.findByRoomId(roomId)
                .orElse(WhiteboardSession.builder().roomId(roomId).strokes(new ArrayList<>()).build());

        if ("CLEAR".equals(action.getType())) {
            session.getStrokes().clear();
        } else {
            session.getStrokes().add(action);
        }

        // Limit the size to prevent massive documents (optional, but good practice for this demo)
        if (session.getStrokes().size() > 5000) {
            // Keep last 4000
            session.setStrokes(new ArrayList<>(session.getStrokes().subList(1000, session.getStrokes().size())));
        }

        whiteboardSessionRepository.save(session);
    }
}
