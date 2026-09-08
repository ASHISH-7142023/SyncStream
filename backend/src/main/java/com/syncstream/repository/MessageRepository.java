package com.syncstream.repository;

import com.syncstream.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByRoomId(String roomId, Pageable pageable);
    List<Message> findByRoomIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(String roomId, Long sequenceNumber);
    long countByRoomIdAndSequenceNumberGreaterThan(String roomId, Long sequenceNumber);
    long countByRoomId(String roomId);
    List<Message> findByParentIdOrderByCreatedAtAsc(String parentId);
    
    Page<Message> findAllBy(TextCriteria criteria, Pageable pageable);
    
    @Query("{ 'roomId': ?0, '$text': { '$search': ?1 } }")
    Page<Message> searchMessagesInRoom(String roomId, String keyword, Pageable pageable);
    
    @Query("{ 'roomId': { $in: ?0 }, '$text': { '$search': ?1 } }")
    Page<Message> searchMessagesInRooms(List<String> roomIds, String keyword, Pageable pageable);
    
    List<Message> findByRoomIdAndPinnedTrueOrderByCreatedAtDesc(String roomId);
}
