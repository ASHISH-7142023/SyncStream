# SyncStream: Visual System Workflows

This document visually maps out the end-to-end architectures and data flows for all the major features in SyncStream using Mermaid diagrams.

---

## 1. Authentication & Connection Workflow
**Goal:** Securely identify users and establish a verified real-time connection.

```mermaid
sequenceDiagram
    participant User as "Client (Browser)"
    participant Auth as "AuthController (API)"
    participant DB as "MongoDB"
    participant WS as "WebSocket Interceptor"
    
    %% Login Flow
    User->>Auth: POST /api/auth/login (Username, Password)
    Auth->>DB: Verify Credentials
    DB-->>Auth: User Document
    Auth-->>User: Return JWT & User Profile
    
    %% WebSocket Connection
    User->>WS: Connect to ws://.../ws with JWT
    WS->>WS: Validate JWT Signature
    alt Invalid Token
        WS-->>User: Connection Rejected (401)
    else Valid Token
        WS-->>User: Connection Accepted (101 Switching Protocols)
    end
```

---

## 2. Real-Time Messaging & Presence (Redis Pub/Sub)
**Goal:** Deliver instant messages to users across multiple server instances.

```mermaid
flowchart TD
    ClientA["User A (Frontend)"] -->|"STOMP Send Message"| Server1["Spring Boot Node 1"]
    ClientB["User B (Frontend)"] -->|"STOMP Subscribe"| Server2["Spring Boot Node 2"]
    
    Server1 -->|"Save to DB"| Mongo[("MongoDB")]
    Server1 -->|"Publish Event"| Redis(("Redis Pub/Sub"))
    
    Redis -->|"Broadcast Event"| Server1
    Redis -->|"Broadcast Event"| Server2
    
    Server1 -->|"STOMP Push"| ClientA
    Server2 -->|"STOMP Push"| ClientB
    
    classDef node fill:#7C3AED,stroke:#4F46E5,color:#fff;
    classDef db fill:#10B981,stroke:#047857,color:#fff;
    classDef redis fill:#E11D48,stroke:#9F1239,color:#fff;
    class Server1,Server2 node;
    class Mongo db;
    class Redis redis;
```

---

## 3. Video & Audio Calling (WebRTC)
**Goal:** Peer-to-peer, low-latency media streaming bypassing the central server.

```mermaid
sequenceDiagram
    participant PeerA as "User A Browser"
    participant Server as "SyncStream Backend"
    participant PeerB as "User B Browser"
    
    Note over PeerA,PeerB: 1. Signaling Phase (Via WebSocket)
    PeerA->>Server: Send WebRTC Offer (SDP)
    Server->>PeerB: Route Offer to User B
    PeerB->>Server: Send WebRTC Answer (SDP)
    Server->>PeerA: Route Answer to User A
    
    PeerA->>Server: Send ICE Candidates (Network Routes)
    Server->>PeerB: Route ICE Candidates
    PeerB->>Server: Send ICE Candidates
    Server->>PeerA: Route ICE Candidates
    
    Note over PeerA,PeerB: 2. Peer-to-Peer Phase (Bypasses Backend)
    PeerA->>PeerB: Direct Encrypted Video/Audio Stream
    PeerB->>PeerA: Direct Encrypted Video/Audio Stream
    PeerA->>PeerB: Screen Sharing Stream
```

---

## 4. File Sharing & Attachments (GridFS)
**Goal:** Stream large files safely using MongoDB GridFS.

```mermaid
sequenceDiagram
    participant User as "Client (Browser)"
    participant API as "FileController"
    participant GridFS as "MongoDB GridFS (Chunks)"
    participant DB as "MongoDB (Message Collection)"
    
    %% Upload Phase
    User->>API: POST /api/files/upload (Multipart File)
    API->>GridFS: Stream file in 255KB chunks
    GridFS-->>API: Return unique File ID
    API-->>User: Return Download URL
    
    %% Attach to Message Phase
    User->>DB: Send Message with File URL attached
    
    %% Download Phase
    User->>API: GET /api/files/{id}
    API->>GridFS: Request chunks for File ID
    GridFS-->>API: Stream chunks
    API-->>User: Pipe stream to Browser (Download)
```

---

## 5. Personalization & Theming
**Goal:** Change UI themes instantly across the application without reloading.

```mermaid
flowchart LR
    User["User clicks Theme in Settings"] --> Context["AuthContext updateSettings"]
    Context --> API["PUT /api/auth/settings"]
    API --> DB[("MongoDB User Doc")]
    DB -.-> API
    API -.-> Context
    
    Context --> DOM["document.documentElement.setAttribute"]
    DOM --> CSS["CSS Variables Triggered"]
    CSS --> UI["Entire App Accent Color Changes"]
    
    style CSS fill:#3B82F6,color:#fff
    style UI fill:#8B5CF6,color:#fff
```

---

## 6. End-to-End User Journey (Page Navigation Flow)
**Goal:** Map out the exact UI navigation paths a user takes from opening the app to interacting inside a room.

![End-to-End User Journey](C:\Users\ASUS\.gemini\antigravity-ide\brain\5e67ad35-699d-47b2-a718-39bc932e9b02\user_journey.png)
