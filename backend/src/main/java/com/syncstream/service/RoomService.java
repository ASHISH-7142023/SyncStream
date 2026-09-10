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
                .admins(new HashSet<>())
                .moderators(new HashSet<>())
                .bannedUsers(new HashSet<>())
                .createdAt(Instant.now())
                .build();
        
        room.getMembers().add(ownerId);
        room.getAdmins().add(ownerId);
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
        
        if (room.getBannedUsers().contains(userId)) {
            throw new SecurityException("You are banned from this room");
        }
        
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

    public Room getOrCreateDirectMessageRoom(String userId1, String userId2) {
        if (userId1.equals(userId2)) {
            throw new IllegalArgumentException("Cannot create DM with yourself");
        }
        return roomRepository.findDirectMessageRoom(userId1, userId2)
                .orElseGet(() -> {
                    Room room = Room.builder()
                            .name("DM-" + userId1 + "-" + userId2)
                            .isDirectMessage(true)
                            .members(new HashSet<>(java.util.Arrays.asList(userId1, userId2)))
                            .createdAt(Instant.now())
                            .build();
                    return roomRepository.save(room);
                });
    }

    public List<Room> getUserRooms(String userId) {
        return roomRepository.findByMembersContaining(userId);
    }

    public boolean isOwner(Room room, String userId) {
        return room.getOwnerId().equals(userId);
    }

    public boolean isAdmin(Room room, String userId) {
        return isOwner(room, userId) || room.getAdmins().contains(userId);
    }

    public boolean isModerator(Room room, String userId) {
        return isAdmin(room, userId) || room.getModerators().contains(userId);
    }

    public Room updateRole(String roomId, String targetUserId, String role, String requesterId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                
        if (!room.getMembers().contains(targetUserId)) {
            throw new IllegalArgumentException("User is not a member of this room");
        }
        
        if (room.getOwnerId().equals(targetUserId)) {
            throw new SecurityException("Cannot change the role of the room owner");
        }
        
        boolean requesterIsOwner = isOwner(room, requesterId);
        boolean requesterIsAdmin = isAdmin(room, requesterId);
        
        if ("ADMIN".equalsIgnoreCase(role)) {
            if (!requesterIsOwner) throw new SecurityException("Only the owner can promote to Admin");
            room.getAdmins().add(targetUserId);
            room.getModerators().remove(targetUserId);
        } else if ("MODERATOR".equalsIgnoreCase(role)) {
            if (!requesterIsAdmin) throw new SecurityException("Only Admins can promote to Moderator");
            room.getModerators().add(targetUserId);
            room.getAdmins().remove(targetUserId);
        } else if ("MEMBER".equalsIgnoreCase(role)) {
            if (room.getAdmins().contains(targetUserId) && !requesterIsOwner) {
                throw new SecurityException("Only the owner can demote an Admin");
            }
            if (!requesterIsAdmin) throw new SecurityException("Only Admins can demote a Moderator");
            room.getAdmins().remove(targetUserId);
            room.getModerators().remove(targetUserId);
        } else {
            throw new IllegalArgumentException("Invalid role");
        }
        
        return roomRepository.save(room);
    }

    public Room kickUser(String roomId, String targetUserId, String requesterId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                
        if (room.getOwnerId().equals(targetUserId)) {
            throw new SecurityException("Cannot kick the room owner");
        }
        
        if (isAdmin(room, targetUserId) && !isOwner(room, requesterId)) {
            throw new SecurityException("Only the owner can kick an Admin");
        }
        
        if (isModerator(room, targetUserId) && !isAdmin(room, requesterId)) {
            throw new SecurityException("Only an Admin can kick a Moderator");
        }
        
        if (!isModerator(room, requesterId)) {
            throw new SecurityException("You do not have permission to kick users");
        }
        
        room.getMembers().remove(targetUserId);
        room.getAdmins().remove(targetUserId);
        room.getModerators().remove(targetUserId);
        return roomRepository.save(room);
    }

    public Room banUser(String roomId, String targetUserId, String requesterId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                
        if (room.getOwnerId().equals(targetUserId)) {
            throw new SecurityException("Cannot ban the room owner");
        }
        
        if (isAdmin(room, targetUserId) && !isOwner(room, requesterId)) {
            throw new SecurityException("Only the owner can ban an Admin");
        }
        
        if (isModerator(room, targetUserId) && !isAdmin(room, requesterId)) {
            throw new SecurityException("Only an Admin can ban a Moderator");
        }
        
        if (!isModerator(room, requesterId)) {
            throw new SecurityException("You do not have permission to ban users");
        }
        
        room.getMembers().remove(targetUserId);
        room.getAdmins().remove(targetUserId);
        room.getModerators().remove(targetUserId);
        room.getBannedUsers().add(targetUserId);
        return roomRepository.save(room);
    }

    public Room unbanUser(String roomId, String targetUserId, String requesterId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                
        if (!isModerator(room, requesterId)) {
            throw new SecurityException("You do not have permission to unban users");
        }
        
        room.getBannedUsers().remove(targetUserId);
        return roomRepository.save(room);
    }
}
