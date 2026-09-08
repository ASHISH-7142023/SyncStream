package com.syncstream.service;

import com.syncstream.dto.ReadReceiptDto;
import com.syncstream.model.ReadReceipt;
import com.syncstream.repository.MessageRepository;
import com.syncstream.repository.ReadReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class ReadReceiptService {

    @Autowired
    private ReadReceiptRepository readReceiptRepository;

    @Autowired
    private MessageRepository messageRepository;

    public ReadReceiptDto updateReadReceipt(String roomId, String userId, String username, String messageId) {
        Optional<ReadReceipt> existing = readReceiptRepository.findByRoomIdAndUserId(roomId, userId);
        
        ReadReceipt receipt;
        if (existing.isPresent()) {
            receipt = existing.get();
            receipt.setMessageId(messageId);
            receipt.setTimestamp(Instant.now());
        } else {
            receipt = ReadReceipt.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .username(username)
                    .messageId(messageId)
                    .timestamp(Instant.now())
                    .build();
        }
        
        receipt = readReceiptRepository.save(receipt);
        
        return ReadReceiptDto.builder()
                .roomId(receipt.getRoomId())
                .userId(receipt.getUserId())
                .username(receipt.getUsername())
                .messageId(receipt.getMessageId())
                .timestamp(receipt.getTimestamp())
                .build();
    }

    public List<ReadReceiptDto> getRoomReadReceipts(String roomId) {
        return readReceiptRepository.findByRoomId(roomId).stream()
                .map(receipt -> ReadReceiptDto.builder()
                        .roomId(receipt.getRoomId())
                        .userId(receipt.getUserId())
                        .username(receipt.getUsername())
                        .messageId(receipt.getMessageId())
                        .timestamp(receipt.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, Long> getUnreadCounts(String userId, List<String> roomIds) {
        Map<String, Long> unreadCounts = new HashMap<>();
        for (String roomId : roomIds) {
            Optional<ReadReceipt> receiptOpt = readReceiptRepository.findByRoomIdAndUserId(roomId, userId);
            if (receiptOpt.isPresent()) {
                String messageId = receiptOpt.get().getMessageId();
                messageRepository.findById(messageId).ifPresentOrElse(message -> {
                    long count = messageRepository.countByRoomIdAndSequenceNumberGreaterThan(roomId, message.getSequenceNumber());
                    unreadCounts.put(roomId, count);
                }, () -> {
                    unreadCounts.put(roomId, 0L);
                });
            } else {
                long count = messageRepository.countByRoomId(roomId);
                unreadCounts.put(roomId, count);
            }
        }
        return unreadCounts;
    }
}
