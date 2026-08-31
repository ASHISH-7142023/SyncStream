package com.syncstream.service;

import com.syncstream.dto.FriendshipDto;
import com.syncstream.dto.UserDto;
import com.syncstream.model.Friendship;
import com.syncstream.model.FriendshipStatus;
import com.syncstream.model.User;
import com.syncstream.repository.FriendshipRepository;
import com.syncstream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public Friendship sendRequest(String requesterId, String receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }
        
        Optional<Friendship> existing1 = friendshipRepository.findByRequesterIdAndReceiverId(requesterId, receiverId);
        Optional<Friendship> existing2 = friendshipRepository.findByRequesterIdAndReceiverId(receiverId, requesterId);
        
        if (existing1.isPresent()) {
            return existing1.get(); // Already requested
        }
        if (existing2.isPresent()) {
            // The other person already requested this person, let's just accept it
            return acceptRequest(requesterId, existing2.get().getId());
        }
        
        Friendship friendship = Friendship.builder()
                .requesterId(requesterId)
                .receiverId(receiverId)
                .status(FriendshipStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
                
        return friendshipRepository.save(friendship);
    }

    public Friendship acceptRequest(String userId, String friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
                
        if (!friendship.getReceiverId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to accept this request");
        }
        
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendship.setUpdatedAt(Instant.now());
        return friendshipRepository.save(friendship);
    }
    
    public void declineRequest(String userId, String friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
                
        if (!friendship.getReceiverId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to decline this request");
        }
        
        friendshipRepository.delete(friendship);
    }

    public List<FriendshipDto> getUserFriends(String userId) {
        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrReceiverId(userId, userId);
        return friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .map(f -> mapToDto(f, userId))
                .collect(Collectors.toList());
    }
    
    public List<FriendshipDto> getPendingRequests(String userId) {
        List<Friendship> friendships = friendshipRepository.findByReceiverIdAndStatus(userId, FriendshipStatus.PENDING);
        return friendships.stream()
                .map(f -> mapToDto(f, userId))
                .collect(Collectors.toList());
    }

    private FriendshipDto mapToDto(Friendship friendship, String currentUserId) {
        String otherUserId = friendship.getRequesterId().equals(currentUserId) 
                ? friendship.getReceiverId() : friendship.getRequesterId();
                
        User otherUser = userRepository.findById(otherUserId).orElse(null);
        UserDto userDto = null;
        if (otherUser != null) {
            userDto = UserDto.builder()
                    .id(otherUser.getId())
                    .username(otherUser.getUsername())
                    .avatar(otherUser.getAvatar())
                    .gender(otherUser.getGender())
                    .build();
        }
        
        return FriendshipDto.builder()
                .id(friendship.getId())
                .user(userDto)
                .status(friendship.getStatus())
                .createdAt(friendship.getCreatedAt())
                .build();
    }
}
