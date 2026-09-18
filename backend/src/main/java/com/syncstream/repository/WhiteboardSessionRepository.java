package com.syncstream.repository;

import com.syncstream.model.WhiteboardSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhiteboardSessionRepository extends MongoRepository<WhiteboardSession, String> {
    Optional<WhiteboardSession> findByRoomId(String roomId);
}
