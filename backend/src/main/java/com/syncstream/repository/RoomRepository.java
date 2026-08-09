package com.syncstream.repository;

import com.syncstream.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByName(String name);
    boolean existsByName(String name);
}
