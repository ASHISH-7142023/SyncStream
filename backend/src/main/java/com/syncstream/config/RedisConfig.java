package com.syncstream.config;

import com.syncstream.pubsub.RedisMessageSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(), com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.NON_FINAL, com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY);
        
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        return template;
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter roomMessageListenerAdapter,
            MessageListenerAdapter typingListenerAdapter,
            MessageListenerAdapter presenceListenerAdapter,
            MessageListenerAdapter webrtcListenerAdapter,
            MessageListenerAdapter notificationListenerAdapter,
            MessageListenerAdapter readReceiptListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        
        // Listen to room messages: syncstream:room:*
        container.addMessageListener(roomMessageListenerAdapter, new PatternTopic("syncstream:room:*"));
        
        // Listen to typing status: syncstream:typing:*
        container.addMessageListener(typingListenerAdapter, new PatternTopic("syncstream:typing:*"));
        
        // Listen to presence: syncstream:presence
        container.addMessageListener(presenceListenerAdapter, new ChannelTopic("syncstream:presence"));
        
        // Listen to WebRTC: syncstream:webrtc:*
        container.addMessageListener(webrtcListenerAdapter, new PatternTopic("syncstream:webrtc:*"));
        
        // Listen to notifications: syncstream:user:*:notifications
        container.addMessageListener(notificationListenerAdapter, new PatternTopic("syncstream:user:*:notifications"));
        
        // Listen to read receipts: syncstream:read_receipts:*
        container.addMessageListener(readReceiptListenerAdapter, new PatternTopic("syncstream:read_receipts:*"));
        
        return container;
    }

    @Bean
    public MessageListenerAdapter roomMessageListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleRoomMessage");
    }

    @Bean
    public MessageListenerAdapter typingListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleTypingMessage");
    }

    @Bean
    public MessageListenerAdapter presenceListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handlePresenceMessage");
    }

    @Bean
    public MessageListenerAdapter webrtcListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleWebRtcMessage");
    }

    @Bean
    public MessageListenerAdapter notificationListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleNotificationMessage");
    }

    @Bean
    public MessageListenerAdapter readReceiptListenerAdapter(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleReadReceiptMessage");
    }
}
