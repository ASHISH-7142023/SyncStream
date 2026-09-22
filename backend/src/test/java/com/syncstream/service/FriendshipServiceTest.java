package com.syncstream.service;

import com.syncstream.dto.FriendshipDto;
import com.syncstream.model.Friendship;
import com.syncstream.model.FriendshipStatus;
import com.syncstream.model.User;
import com.syncstream.repository.FriendshipRepository;
import com.syncstream.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FriendshipServiceTest {

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FriendshipService friendshipService;

    private User requester;
    private User receiver;
    private Friendship pendingFriendship;

    @BeforeEach
    void setUp() {
        requester = User.builder()
                .id("user-1")
                .username("john_doe")
                .build();

        receiver = User.builder()
                .id("user-2")
                .username("jane_doe")
                .build();

        pendingFriendship = Friendship.builder()
                .id("friendship-123")
                .requesterId(requester.getId())
                .receiverId(receiver.getId())
                .status(FriendshipStatus.PENDING)
                .build();
    }

    @Test
    void testSendRequest_Success() {
        when(friendshipRepository.findByRequesterIdAndReceiverId(requester.getId(), receiver.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.findByRequesterIdAndReceiverId(receiver.getId(), requester.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(pendingFriendship);
        when(userRepository.findById(requester.getId())).thenReturn(Optional.of(requester));

        Friendship result = friendshipService.sendRequest(requester.getId(), receiver.getId());

        assertNotNull(result);
        assertEquals(FriendshipStatus.PENDING, result.getStatus());
        verify(notificationService).createNotification(
                eq(receiver.getId()),
                eq("New Friend Request"),
                anyString(),
                eq("FRIEND_REQUEST"),
                eq(pendingFriendship.getId()),
                any()
        );
    }

    @Test
    void testSendRequest_ToSelf_ThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            friendshipService.sendRequest(requester.getId(), requester.getId());
        });

        assertEquals("Cannot send friend request to yourself", exception.getMessage());
    }

    @Test
    void testAcceptRequest_Success() {
        when(friendshipRepository.findById(pendingFriendship.getId())).thenReturn(Optional.of(pendingFriendship));
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(pendingFriendship);
        when(userRepository.findById(receiver.getId())).thenReturn(Optional.of(receiver));

        Friendship result = friendshipService.acceptRequest(receiver.getId(), pendingFriendship.getId());

        assertEquals(FriendshipStatus.ACCEPTED, result.getStatus());
        verify(notificationService).createNotification(
                eq(requester.getId()),
                eq("Friend Request Accepted"),
                anyString(),
                eq("FRIEND_ACCEPT"),
                eq(pendingFriendship.getId()),
                any()
        );
    }

    @Test
    void testAcceptRequest_NotAuthorized_ThrowsException() {
        when(friendshipRepository.findById(pendingFriendship.getId())).thenReturn(Optional.of(pendingFriendship));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            friendshipService.acceptRequest("user-3", pendingFriendship.getId());
        });

        assertEquals("Not authorized to accept this request", exception.getMessage());
    }

    @Test
    void testDeclineRequest_Success() {
        when(friendshipRepository.findById(pendingFriendship.getId())).thenReturn(Optional.of(pendingFriendship));

        friendshipService.declineRequest(receiver.getId(), pendingFriendship.getId());

        verify(friendshipRepository).delete(pendingFriendship);
    }

    @Test
    void testGetUserFriends() {
        pendingFriendship.setStatus(FriendshipStatus.ACCEPTED);
        when(friendshipRepository.findByRequesterIdOrReceiverId(requester.getId(), requester.getId()))
                .thenReturn(Arrays.asList(pendingFriendship));
        when(userRepository.findById(receiver.getId())).thenReturn(Optional.of(receiver));

        List<FriendshipDto> friends = friendshipService.getUserFriends(requester.getId());

        assertEquals(1, friends.size());
        assertEquals(receiver.getUsername(), friends.get(0).getUser().getUsername());
    }

    @Test
    void testGetPendingRequests() {
        when(friendshipRepository.findByReceiverIdAndStatus(receiver.getId(), FriendshipStatus.PENDING))
                .thenReturn(Arrays.asList(pendingFriendship));
        when(userRepository.findById(requester.getId())).thenReturn(Optional.of(requester));

        List<FriendshipDto> requests = friendshipService.getPendingRequests(receiver.getId());

        assertEquals(1, requests.size());
        assertEquals(requester.getUsername(), requests.get(0).getUser().getUsername());
    }
}
