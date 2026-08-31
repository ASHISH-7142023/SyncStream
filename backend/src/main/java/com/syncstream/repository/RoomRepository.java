package com.syncstream.repository;

import com.syncstream.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByName(String name);
    boolean existsByName(String name);

    @org.springframework.data.mongodb.repository.Query("{ 'isDirectMessage': true, 'members': { $all: [?0, ?1], $size: 2 } }")
    Optional<Room> findDirectMessageRoom(String userId1, String userId2);

    java.util.List<Room> findByMembersContaining(String userId);
}
