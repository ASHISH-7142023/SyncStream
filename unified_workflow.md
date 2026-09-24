# Unified SyncStream Master Workflow

This massive flowchart maps the entire SyncStream ecosystem into a single, comprehensive diagram. It visualizes how the frontend pages connect to the REST APIs, how WebSockets route through Spring Boot and Redis, and how MongoDB stores the encrypted data and file chunks.

```mermaid
flowchart TD
    %% Global Entry
    Client([Browser / React Client]) --> AuthCheck{"Has Valid JWT?"}

    %% -------------------------------------
    %% 1. AUTHENTICATION SUBSYSTEM
    %% -------------------------------------
    subgraph Authentication [Authentication System]
        AuthCheck -->|No| AuthForms("Login / Register Page")
        AuthForms -->|Submit| APIAuth["POST /api/auth"]
        APIAuth --> MongoAuth[("MongoDB (Users)")]
        MongoAuth -->|Valid| DeriveKeys["Derive AES Keys & Store JWT"]
        DeriveKeys --> Dashboard
        AuthCheck -->|Yes| Dashboard
    end

    %% -------------------------------------
    %% 2. DASHBOARD & ROOM MANAGEMENT
    %% -------------------------------------
    subgraph DashboardSys [Dashboard & Settings]
        Dashboard["Dashboard Page (/)"] --> CreateRoom("Create Room")
        Dashboard --> JoinRoom("Join Room")
        Dashboard --> SelectRoom("Select Existing Room")
        Dashboard --> Profile("Profile Settings")
        
        CreateRoom --> APIRoom["POST /api/rooms"]
        JoinRoom --> APIRoom
        APIRoom --> MongoRoom[("MongoDB (Rooms)")]
    end

    %% -------------------------------------
    %% 3. REAL-TIME CHAT (STOMP / REDIS)
    %% -------------------------------------
    SelectRoom --> RoomInterface["Room Chat Interface (/rooms/:id)"]
    
    subgraph RealTimeChat [Real-Time Messaging (STOMP / WebSockets)]
        RoomInterface --> WSConnect(("Connect to ws://.../ws"))
        WSConnect --> SpringBoot["Spring Boot Backend (WebSocket Interceptor)"]
        
        SpringBoot -->|Validate Token| RedisPubSub(("Redis Pub/Sub"))
        RedisPubSub -.->|Broadcast| SpringBoot
        
        SpringBoot -->|Save History| MongoMessages[("MongoDB (Messages)")]
        SpringBoot -.->|Push Message| RoomInterface
        
        RoomInterface --> SendMsg["Encrypt & Send Message"]
        SendMsg --> SpringBoot
    end

    %% -------------------------------------
    %% 4. WEBRTC MEDIA & CALLING
    %% -------------------------------------
    subgraph WebRTC [WebRTC Video & Audio]
        RoomInterface --> StartCall("Initiate Call")
        StartCall --> Signaling["Send SDP Offer (via STOMP)"]
        Signaling --> SpringBoot
        SpringBoot -.->|Route SDP| Peer["Other Participant"]
        
        Peer -.->|SDP Answer| SpringBoot
        SpringBoot -.->|Route Answer| StartCall
        
        StartCall <==>|Direct P2P Encrypted Media Stream| Peer
    end

    %% -------------------------------------
    %% 5. SECURE FILE SHARING (GridFS)
    %% -------------------------------------
    subgraph FileSharing [File Uploads & GridFS]
        RoomInterface --> Upload["Encrypt File & Upload"]
        Upload --> APIFile["POST /api/files"]
        APIFile --> GridFS[("MongoDB GridFS (Chunks)")]
        
        GridFS -->|Return File ID| APIFile
        APIFile -->|Return URL| RoomInterface
        RoomInterface --> SendMsg
    end
    
    %% -------------------------------------
    %% STYLING
    %% -------------------------------------
    classDef frontend fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef backend fill:#7C3AED,stroke:#4F46E5,stroke-width:2px,color:#fff;
    classDef db fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef redis fill:#E11D48,stroke:#9F1239,stroke-width:2px,color:#fff;
    classDef p2p fill:#d97706,stroke:#b45309,stroke-width:2px,color:#fff;

    class Client,AuthForms,Dashboard,CreateRoom,JoinRoom,SelectRoom,Profile,RoomInterface,SendMsg,StartCall,Upload frontend;
    class APIAuth,APIRoom,SpringBoot,APIFile,Signaling backend;
    class MongoAuth,MongoRoom,MongoMessages,GridFS db;
    class RedisPubSub redis;
    class Peer p2p;
```
