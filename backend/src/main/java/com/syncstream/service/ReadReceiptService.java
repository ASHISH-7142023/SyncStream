package com.syncstream.service;

import com.syncstream.dto.ReadReceiptDto;
import com.syncstream.model.ReadReceipt;
import com.syncstream.repository.ReadReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReadReceiptService {

    @Autowired
    private ReadReceiptRepository readReceiptRepository;

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
}
