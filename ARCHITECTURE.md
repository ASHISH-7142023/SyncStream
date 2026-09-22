# SyncStream Architecture

SyncStream is designed as a distributed, full-stack application built to handle real-time chat, file sharing, and robust End-to-End Encryption (E2EE).

## High-Level Architecture Diagram

```mermaid
graph TD
    Client[Client Browser (React SPA)] -->|HTTP/HTTPS / WS/WSS| Nginx[Nginx Reverse Proxy]
    
    subfront[Frontend Static Serving]
    Nginx -->|Static Assets| subfront
    
    Nginx -->|/api/* & /ws/* Proxy| Backend[Spring Boot Backend]
    
    Backend <-->|Data Persistence| Mongo[(MongoDB)]
    Backend <-->|Session / PubSub| Redis[(Redis)]
```

## 1. Client-Side (Frontend)
The frontend is built using **React 18** and **Vite** for fast, modular development.

- **Routing**: `react-router-dom` handles client-side routing.
- **State Management**: React Context (`AuthContext`, `SocketContext`, etc.) manages global state such as authentication, websocket connections, and cryptographic keys.
- **Styling**: Tailwind CSS ensures a fast and consistent dark-mode aesthetic.
- **WebCrypto API**: All encryption/decryption happens directly in the browser memory to ensure true End-to-End Encryption. Private keys never leave the browser unencrypted.

## 2. Server-Side (Backend)
The backend is powered by **Spring Boot 3** and **Java 21**, ensuring robust scalability and thread safety.

- **Controllers (`/api/*`)**: Handle RESTful requests for Authentication, User Management, Room operations, and File Metadata.
- **WebSocket (`/ws/*`)**: Managed by Spring WebSocket STOMP. Enables full-duplex real-time communication for chat and status updates.
- **Security (`Spring Security`)**:
  - JWT (JSON Web Tokens) are used for stateless authentication.
  - BCrypt is used for password hashing.
  - Role-based and Resource-based access control prevents users from accessing rooms they aren't invited to.

## 3. Data Tier
- **MongoDB**: The primary NoSQL datastore for structured document storage.
  - Collections: `users`, `rooms`, `messages`, `files`.
  - Chosen for its flexibility with schema-less JSON-like documents, which fits naturally with chat and metadata storage.
- **Redis**: The in-memory data structure store used for:
  - WebSocket session tracking and pub/sub.
  - Temporary token caching or status management.

## 4. End-to-End Encryption (E2EE) Flow
SyncStream guarantees privacy through robust cryptographic design:
1. **Key Generation**: When a user registers, their browser generates a robust RSA-OAEP Key Pair.
2. **Key Wrapping**: The Private Key is wrapped (encrypted) using AES-GCM, derived via PBKDF2 from their plaintext password and salt.
3. **Storage**: The backend only stores the public key and the wrapped (encrypted) private key.
4. **Room Keys**: When a room is created, an AES-GCM symmetric room key is generated. This room key is then encrypted uniquely with the public key of every member of the room.
5. **Decryption**: To read a message, a user unwraps their private key locally (upon login), uses it to decrypt the room key, and then uses the room key to decrypt incoming messages and files. 

*Zero-Knowledge Guarantee: The backend never sees plaintext passwords, plaintext private keys, plaintext room keys, or plaintext messages.*

## 5. Deployment Topology (Docker Compose)
The application runs as a fleet of containers orchestrated by Docker Compose:

1. **`frontend`**: An Nginx alpine container that:
   - Serves the static React build (`dist/`) on Port 80.
   - Proxies `/api` and `/ws` requests to the `backend` container via an internal Docker network, resolving cross-origin (CORS) limits gracefully.
2. **`backend`**: The compiled Spring Boot JAR running in a JRE container on Port 8080.
3. **`mongodb`**: (Optional local fallback) A MongoDB instance.
4. **`redis`**: (Optional local fallback) A Redis instance.

In production, MongoDB and Redis are typically pointed to managed cloud services (e.g., MongoDB Atlas, Upstash Redis) using `.env` variables.
