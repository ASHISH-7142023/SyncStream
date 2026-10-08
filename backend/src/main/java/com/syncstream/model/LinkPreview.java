package com.syncstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
/**
 * Represents generated rich-link preview metadata for messages.
 */
public class LinkPreview {
    private String url;
    private String title;
    private String description;
    private String imageUrl;
    private String siteName;
}

