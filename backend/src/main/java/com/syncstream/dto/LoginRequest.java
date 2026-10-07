package com.syncstream.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
/**
 * Payload for user authentication login requests.
 */
public class LoginRequest {
    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    private String password;
}

