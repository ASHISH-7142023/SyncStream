package com.syncstream.config;

import com.syncstream.security.WebSocketAuthInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private WebSocketAuthInterceptor authInterceptor;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use local memory broker for broadcasting to local clients
        config.enableSimpleBroker("/topic");
        // Prefix for client-to-server mappings (e.g. /app/rooms/{roomId}/message)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register standard WebSocket connection endpoint
        String[] origins = allowedOrigins.split(",");
        String[] secureOrigins = new String[origins.length + 1];
        System.arraycopy(origins, 0, secureOrigins, 0, origins.length);
        secureOrigins[origins.length] = "http://localhost:5173"; // Allow local dev

        registry.addEndpoint("/ws")
                .setAllowedOrigins(secureOrigins);
        
        // Also support SockJS fallback if needed
        registry.addEndpoint("/ws")
                .setAllowedOrigins(secureOrigins)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add authentication interceptor to process JWT during STOMP CONNECT
        registration.interceptors(authInterceptor);
    }
}
