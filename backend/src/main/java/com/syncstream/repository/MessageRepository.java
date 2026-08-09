package com.syncstream.repository;

import com.syncstream.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByRoomId(String roomId, Pageable pageable);
    List<Message> findByRoomIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(String roomId, Long sequenceNumber);
}
