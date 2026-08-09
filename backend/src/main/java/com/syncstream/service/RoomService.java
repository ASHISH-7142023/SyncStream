package com.syncstream.service;

import com.syncstream.model.Room;
import com.syncstream.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public Room createRoom(String name, String description, String ownerId) {
        if (roomRepository.existsByName(name)) {
            throw new IllegalArgumentException("Room name already exists");
        }
        Room room = Room.builder()
                .name(name)
                .description(description)
                .ownerId(ownerId)
                .members(new HashSet<>())
                .createdAt(Instant.now())
                .build();
        
        room.getMembers().add(ownerId);
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(String roomId) {
        return roomRepository.findById(roomId);
    }

    public void deleteRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        if (!room.getOwnerId().equals(userId)) {
            throw new SecurityException("Only room owner can delete this room");
        }
        
        roomRepository.delete(room);
    }

    public Room joinRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        room.getMembers().add(userId);
        return roomRepository.save(room);
    }

    public Room leaveRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        room.getMembers().remove(userId);
        return roomRepository.save(room);
    }

    public boolean isMember(String roomId, String userId) {
        return roomRepository.findById(roomId)
                .map(room -> room.getMembers().contains(userId))
                .orElse(false);
    }
}
