package com.syncstream.repository;

import com.syncstream.model.PushSubscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
/**
 * Manages Web Push subscription endpoints for users.
 */
public interface PushSubscriptionRepository extends MongoRepository<PushSubscription, String> {
    List<PushSubscription> findByUserId(String userId);
    void deleteByEndpoint(String endpoint);
    void deleteByUserId(String userId);
}

