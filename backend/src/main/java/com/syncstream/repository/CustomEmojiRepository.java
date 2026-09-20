package com.syncstream.repository;

import com.syncstream.model.CustomEmoji;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomEmojiRepository extends MongoRepository<CustomEmoji, String> {
    Optional<CustomEmoji> findByShortcut(String shortcut);
    boolean existsByShortcut(String shortcut);
}
