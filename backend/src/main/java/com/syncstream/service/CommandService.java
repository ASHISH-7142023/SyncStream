package com.syncstream.service;

import com.syncstream.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class CommandService {

    @Value("${app.giphy.api-key:dc6zaTOxFJmzC}")
    private String giphyApiKey;

    @Autowired
    private NotificationService notificationService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    public boolean isCommand(String content) {
        return content != null && content.trim().startsWith("/");
    }

    public Optional<String> processCommand(String content, User sender) {
        String trimmed = content.trim();
        
        if (trimmed.startsWith("/gif ")) {
            return handleGif(trimmed.substring(5).trim());
        } else if (trimmed.startsWith("/remind ")) {
            handleRemind(trimmed.substring(8).trim(), sender);
            return Optional.empty(); // No public message for remind
        }
        
        return Optional.empty(); // Unknown or unhandled command
    }

    private Optional<String> handleGif(String query) {
        if (query.isEmpty()) return Optional.empty();

        try {
            String url = "https://api.giphy.com/v1/gifs/search?api_key=" + giphyApiKey + "&q=" + query + "&limit=1";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("data")) {
                java.util.List<Map<String, Object>> data = (java.util.List<Map<String, Object>>) response.get("data");
                if (!data.isEmpty()) {
                    Map<String, Object> images = (Map<String, Object>) data.get(0).get("images");
                    Map<String, Object> original = (Map<String, Object>) images.get("original");
                    String gifUrl = (String) original.get("url");

                    String markdownContent = "![GIF](" + gifUrl + ")";
                    return Optional.of(markdownContent);
                }
            }
        } catch (Exception e) {
            log.error("Error fetching GIF from Giphy: {}", e.getMessage());
        }
        return Optional.empty();
    }

    private void handleRemind(String args, User sender) {
        Pattern pattern = Pattern.compile("^(\\d+)([smh])\\s+(.+)$");
        Matcher matcher = pattern.matcher(args);

        if (matcher.matches()) {
            int timeValue = Integer.parseInt(matcher.group(1));
            String unit = matcher.group(2);
            String message = matcher.group(3);

            TimeUnit timeUnit = TimeUnit.SECONDS;
            if (unit.equals("m")) timeUnit = TimeUnit.MINUTES;
            else if (unit.equals("h")) timeUnit = TimeUnit.HOURS;

            scheduler.schedule(() -> {
                try {
                    notificationService.createNotification(
                            sender.getId(),
                            "Reminder",
                            message,
                            "REMINDER",
                            null,
                            null
                    );
                } catch (Exception e) {
                    log.error("Failed to send reminder notification: {}", e.getMessage());
                }
            }, timeValue, timeUnit);
            
            log.info("Scheduled reminder for user {} in {} {}", sender.getId(), timeValue, unit);
        } else {
            log.warn("Invalid reminder format: {}", args);
        }
    }
}
