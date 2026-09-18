package com.syncstream.repository;

import com.syncstream.model.Webhook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebhookRepository extends MongoRepository<Webhook, String> {
    List<Webhook> findByRoomId(String roomId);
    Optional<Webhook> findByToken(String token);
}
