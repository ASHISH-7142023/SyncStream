# SyncStream: Visual System Workflows

This document visually maps out the end-to-end architectures, data flows, and user journeys for all the major features in SyncStream using Mermaid diagrams.

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

## 6. End-to-End User Journey
**Goal:** Map out the high-level user journey and navigation paths throughout the SyncStream frontend application.

```mermaid
graph TD
    %% Core Entry
    Entry(["User Visits http://localhost"]) --> AuthCheck{"Is Authenticated? <br/> (Valid JWT)"}

    %% Authentication Flow
    AuthCheck -->|No| AuthPage["Authentication Page"]
    AuthPage --> Login["Login Form"]
    AuthPage --> Register["Register Form"]
    
    Register --> |Derive Encryption Keys| Login
    Login --> |Store JWT & Unlock Keys| Dashboard["Dashboard / Home"]
    
    %% Dashboard Flow
    AuthCheck -->|Yes| Dashboard
    
    Dashboard --> CreateRoom("➕ Create New Room")
    Dashboard --> JoinRoom("🔗 Join Room via Code")
    Dashboard --> SelectRoom("💬 Select Existing Room")
    Dashboard --> Profile("👤 View Profile")

    %% Room Interactions
    SelectRoom --> RoomChat["Room Chat Interface"]
    CreateRoom --> RoomChat
    JoinRoom --> RoomChat

    %% Inside the Room
    subgraph Room Activity
        RoomChat --> ConnectWS(("Connect WebSocket"))
        ConnectWS --> Decrypt["Decrypt Message History"]
        RoomChat --> SendMsg["Type & Send Message"]
        RoomChat --> UploadFile["Encrypt & Upload File"]
        RoomChat --> ViewMembers["View Active Participants"]
    end

    %% Profile & Settings
    Profile --> EditProfile["Edit Display Name / Avatar"]
    Profile --> Logout["Logout & Clear Session"]
    Logout --> AuthPage

    %% Styling
    classDef page fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef action fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#fff;
    classDef logic fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef terminal fill:#ef4444,stroke:#7f1d1d,stroke-width:2px,color:#fff;
    classDef connection fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;

    class Dashboard,RoomChat,AuthPage,Profile page;
    class CreateRoom,JoinRoom,SelectRoom,Login,Register,SendMsg,UploadFile,ViewMembers,EditProfile action;
    class AuthCheck logic;
    class Logout terminal;
    class ConnectWS,Decrypt connection;
```

---

## 7. Individual Page Workflows

### 7.1. Authentication Page (`/login` & `/register`)
Handles user identity verification and local cryptographic key generation.

```mermaid
flowchart TD
    Start([User navigates to app]) --> AuthGate
    
    subgraph AuthGate [Authentication Check]
        direction LR
        CheckJWT(Check for existing JWT) --> Valid{Is Token Valid?}
    end
    
    Valid -->|Yes| End1([Redirect to Dashboard])
    Valid -->|No| LoginForm
    
    subgraph LoginForm [Login Form]
        InputCreds(Enter Credentials) --> SubmitLogin(Submit Login)
        SubmitLogin --> ServerVerify(Server Verifies)
        ServerVerify --> UnwrapKeys(Unwrap Encrypted Private Key)
    end
    
    subgraph RegisterForm [Register Form]
        InputNewCreds(Enter New Credentials) --> GenerateKeys(Generate RSA-OAEP Key Pair)
        GenerateKeys --> WrapKeys(Wrap Private Key w/ Password)
        WrapKeys --> SubmitReg(Submit to Server)
    end
    
    LoginForm -.->|Clicks 'Sign Up'| RegisterForm
    RegisterForm -.->|Success| LoginForm
    UnwrapKeys --> End2([Keys Loaded in Memory - Redirect to Dashboard])
```

### 7.2. Dashboard / Rooms Page (`/`)
The central hub where users manage and discover their chat rooms.

```mermaid
flowchart TD
    Start([Route `/`]) --> FetchRooms
    
    subgraph DashboardLoaded [Dashboard Initialization]
        FetchRooms(Fetch User's Rooms from API) --> RenderList(Render Room List)
    end
    
    RenderList --> UserActions
    
    subgraph UserActions [User Interactions]
        ClickRoom(Click Existing Room)
        CreateRoomBtn(Click 'Create Room')
        JoinRoomBtn(Click 'Join Room')
    end
    
    subgraph CreateModal [Create Room Modal]
        InputName(Enter Room Name) --> GenRoomKey(Generate AES-GCM Room Key)
        GenRoomKey --> EncryptRoomKey(Encrypt Room Key with My Public Key)
        EncryptRoomKey --> SubmitCreate(POST /api/rooms)
    end
    
    subgraph JoinModal [Join Room Modal]
        InputCode(Enter 6-Digit Room Code) --> SubmitJoin(POST /api/rooms/join)
        SubmitJoin --> ServerAdds(Server Adds User to Room)
        ServerAdds --> FetchKeys(Fetch Room Key encrypted for My Public Key)
    end
    
    CreateRoomBtn --> CreateModal
    JoinRoomBtn --> JoinModal
    
    SubmitCreate -->|Room Created| ClickRoom
    FetchKeys -->|Room Joined| ClickRoom
    ClickRoom --> End([Navigate to `/rooms/:id`])
```

### 7.3. Room Chat Page (`/rooms/:id`)
The core real-time messaging and file sharing interface.

```mermaid
flowchart TD
    Start([Route `/rooms/:id`]) --> LoadMetadata
    
    subgraph EnterRoom [Room Initialization]
        LoadMetadata(Load Room Metadata) --> InitWS(Initialize STOMP over WebSockets)
        InitWS --> Subscribe(Subscribe to `/topic/rooms/:id`)
    end
    
    subgraph Messaging [Messaging Flow]
        TypeMessage(Type Text) --> EncryptMessage(Encrypt Payload with Room Key)
        EncryptMessage --> SendSTOMP(Send over WebSocket)
        SendSTOMP -.->|Broadcast| ReceiveSTOMP(Receive Encrypted Payload)
        ReceiveSTOMP --> DecryptMessage(Decrypt Payload with Room Key)
        DecryptMessage --> RenderUI(Render Message in Chat Log)
    end
    
    subgraph FileSharing [File Sharing Flow]
        SelectFile(Select File to Upload) --> EncryptChunks(Encrypt File Chunks locally)
        EncryptChunks --> UploadAPI(POST Encrypted File to API)
        UploadAPI --> SendFileMetadata(Send Metadata over WebSocket)
    end
    
    Subscribe --> Messaging
    Subscribe --> FileSharing
    
    subgraph Sidebar [Sidebar Navigation]
        ViewMembers(View Participant List)
        ViewFiles(View Shared Files Tab)
        LeaveRoomBtn(Leave Room)
    end
    
    Subscribe --> Sidebar
    LeaveRoomBtn --> End([Navigate back to Dashboard])
```

### 7.4. Profile Settings Page (`/profile`)
Where the user manages their account and session.

```mermaid
flowchart TD
    Start([Route `/profile`]) --> FetchUser
    
    subgraph ProfileLoaded [Profile Initialization]
        FetchUser(Fetch `/api/users/me`) --> RenderData(Display Username & Avatar)
    end
    
    subgraph ProfileActions [Available Actions]
        ChangeAvatar(Update Profile Picture)
        ChangePasswordBtn(Change Password)
        LogoutBtn(Logout)
    end
    
    RenderData --> ProfileActions
    
    subgraph PasswordChange [Change Password Flow]
        InputOld(Input Old Password) --> InputNew(Input New Password)
        InputNew --> RewrapKeys(Decrypt Private Key & Rewrap with New Password)
        RewrapKeys --> SubmitPass(Submit to Server)
    end
    
    ChangePasswordBtn --> PasswordChange
    PasswordChange -.->|Success| ProfileLoaded
    
    LogoutBtn --> ClearLocal(Clear Local Storage & Memory Keys)
    ClearLocal --> End([Redirect to `/login`])
```
