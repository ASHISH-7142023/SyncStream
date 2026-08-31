package com.syncstream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String username;
    private String gender;
    private String avatar;
}
