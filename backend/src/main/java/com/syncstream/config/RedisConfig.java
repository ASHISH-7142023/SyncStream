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
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter roomMessageListenerAdapter,
            MessageListenerAdapter typingListenerAdapter,
            MessageListenerAdapter presenceListenerAdapter,
            MessageListenerAdapter webrtcListenerAdapter) {
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
}
