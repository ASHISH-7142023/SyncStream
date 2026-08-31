package com.syncstream.repository;

import com.syncstream.model.Friendship;
import com.syncstream.model.FriendshipStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends MongoRepository<Friendship, String> {
    Optional<Friendship> findByRequesterIdAndReceiverId(String requesterId, String receiverId);
    List<Friendship> findByRequesterIdOrReceiverId(String requesterId, String receiverId);
    List<Friendship> findByReceiverIdAndStatus(String receiverId, FriendshipStatus status);
}
