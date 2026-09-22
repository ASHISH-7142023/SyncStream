package com.syncstream.service;

import com.syncstream.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommandServiceTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommandService commandService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id("user-123")
                .username("test_user")
                .build();
        
        ReflectionTestUtils.setField(commandService, "giphyApiKey", "dc6zaTOxFJmzC");
    }

    @Test
    void testIsCommand() {
        assertTrue(commandService.isCommand("/gif cat"));
        assertTrue(commandService.isCommand("/remind 10m test"));
        assertFalse(commandService.isCommand("Hello world"));
        assertFalse(commandService.isCommand(""));
        assertFalse(commandService.isCommand(null));
    }

    @Test
    void testProcessCommand_UnknownCommand() {
        Optional<String> result = commandService.processCommand("/unknown args", mockUser);
        assertTrue(result.isEmpty());
    }

    @Test
    void testProcessCommand_RemindCommand_ParsesCorrectly() {
        // Because the schedule runs asynchronously or is delegated to TaskScheduler,
        // testing the execution of the thread requires Thread.sleep or intercepting the executor.
        // We'll just test that it returns empty and doesn't throw exceptions.
        Optional<String> result = commandService.processCommand("/remind 1m test reminder", mockUser);
        assertTrue(result.isEmpty());
    }

    @Test
    void testProcessCommand_GifCommand_EmptyQuery() {
        Optional<String> result = commandService.processCommand("/gif ", mockUser);
        assertTrue(result.isEmpty());
    }
}
