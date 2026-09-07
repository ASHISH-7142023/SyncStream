package com.syncstream.repository;

import com.syncstream.model.ReadReceipt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadReceiptRepository extends MongoRepository<ReadReceipt, String> {
    Optional<ReadReceipt> findByRoomIdAndUserId(String roomId, String userId);
    List<ReadReceipt> findByRoomId(String roomId);
}
