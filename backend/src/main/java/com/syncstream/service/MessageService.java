package com.syncstream.service;

import com.syncstream.model.Message;
import com.syncstream.model.MessageType;
import com.syncstream.model.User;
import com.syncstream.repository.MessageRepository;
import com.syncstream.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public Message saveMessage(String roomId, String senderId, String content, MessageType messageType) {
        String senderName = userRepository.findById(senderId)
                .map(User::getUsername)
                .orElse("Unknown");

        Long sequenceNumber = getNextSequenceNumber(roomId);

        Message message = Message.builder()
                .roomId(roomId)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .messageType(messageType)
                .createdAt(Instant.now())
                .sequenceNumber(sequenceNumber)
                .build();

        return messageRepository.save(message);
    }

    public Page<Message> getRoomMessages(String roomId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sequenceNumber"));
        return messageRepository.findByRoomId(roomId, pageRequest);
    }

    public List<Message> getMessagesAfter(String roomId, Long sequenceNumber) {
        return messageRepository.findByRoomIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(roomId, sequenceNumber);
    }

    private synchronized Long getNextSequenceNumber(String roomId) {
        String key = "syncstream:room:" + roomId + ":seq";
        Long seq = redisTemplate.opsForValue().increment(key);
        
        if (seq == null || seq == 1) {
            PageRequest pageRequest = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "sequenceNumber"));
            Page<Message> lastMessagePage = messageRepository.findByRoomId(roomId, pageRequest);
            if (lastMessagePage.hasContent()) {
                Long maxDbSeq = lastMessagePage.getContent().get(0).getSequenceNumber();
                if (maxDbSeq >= (seq != null ? seq : 0)) {
                    seq = maxDbSeq + 1;
                    redisTemplate.opsForValue().set(key, seq);
                }
            }
        }
        return seq;
    }
}
