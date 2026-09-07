package com.syncstream.service;

import com.syncstream.model.LinkPreview;
import com.syncstream.model.Message;
import com.syncstream.repository.MessageRepository;
import com.syncstream.pubsub.RedisMessagePublisher;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class LinkPreviewService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private RedisMessagePublisher redisMessagePublisher;

    private static final Pattern URL_PATTERN = Pattern.compile(
            "https?://(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)"
    );

    public void generatePreviewsAsync(Message message) {
        if (message.getContent() == null || message.getContent().trim().isEmpty()) {
            return;
        }

        List<String> urls = extractUrls(message.getContent());
        if (urls.isEmpty()) {
            return;
        }

        CompletableFuture.runAsync(() -> {
            List<LinkPreview> previews = new ArrayList<>();
            for (String url : urls) {
                try {
                    // Limit to 3 previews per message
                    if (previews.size() >= 3) break;
                    
                    LinkPreview preview = fetchPreview(url);
                    if (preview != null && (preview.getTitle() != null || preview.getImageUrl() != null)) {
                        previews.add(preview);
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch link preview for url: {}", url, e);
                }
            }

            if (!previews.isEmpty()) {
                messageRepository.findById(message.getId()).ifPresent(existingMsg -> {
                    existingMsg.setLinkPreviews(previews);
                    Message updatedMsg = messageRepository.save(existingMsg);
                    
                    // Broadcast the updated message so clients render the preview cards
                    redisMessagePublisher.publish("syncstream:room:" + updatedMsg.getRoomId(), updatedMsg);
                });
            }
        });
    }

    private List<String> extractUrls(String text) {
        List<String> urls = new ArrayList<>();
        Matcher matcher = URL_PATTERN.matcher(text);
        while (matcher.find()) {
            urls.add(matcher.group());
        }
        return urls;
    }

    private LinkPreview fetchPreview(String urlString) {
        try {
            Document doc = Jsoup.connect(urlString)
                    .timeout(5000)
                    .userAgent("SyncStream Bot/1.0 (+https://syncstream.com)")
                    .get();

            String title = getMetaTagContent(doc, "meta[property=og:title]");
            if (title == null) {
                title = doc.title();
            }

            String description = getMetaTagContent(doc, "meta[property=og:description]");
            if (description == null) {
                description = getMetaTagContent(doc, "meta[name=description]");
            }

            String imageUrl = getMetaTagContent(doc, "meta[property=og:image]");
            
            // Handle relative image URLs
            if (imageUrl != null && !imageUrl.startsWith("http")) {
                URL url = new URL(urlString);
                String baseUrl = url.getProtocol() + "://" + url.getHost();
                imageUrl = imageUrl.startsWith("/") ? baseUrl + imageUrl : baseUrl + "/" + imageUrl;
            }

            String siteName = getMetaTagContent(doc, "meta[property=og:site_name]");

            return LinkPreview.builder()
                    .url(urlString)
                    .title(title)
                    .description(description)
                    .imageUrl(imageUrl)
                    .siteName(siteName)
                    .build();
        } catch (Exception e) {
            log.warn("Error fetching link preview for {}: {}", urlString, e.getMessage());
            return null;
        }
    }

    private String getMetaTagContent(Document doc, String cssQuery) {
        org.jsoup.select.Elements elements = doc.select(cssQuery);
        if (!elements.isEmpty()) {
            return elements.first().attr("content");
        }
        return null;
    }
}
