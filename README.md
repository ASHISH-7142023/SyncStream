<div align="center">
  <img src="frontend/public/logo.png" alt="SyncStream Logo" width="120" />
  <br/>
  <img src="frontend/public/name.png" alt="SyncStream Name" height="60" />
  
  <p>A real-time, highly scalable, and secure team communication platform.</p>

  <p align="center">
    <a href="https://skillicons.dev">
      <img src="https://skillicons.dev/icons?i=java,spring,ts,react,tailwind,docker,mongodb,redis,nginx&theme=dark" alt="Languages and Technologies" />
    </a>
  </p>
</div>

---

> Designed for high performance and seamless interaction, SyncStream features real-time messaging, end-to-end encryption (E2EE), WebSocket integrations, and an intuitive modern UI.

---

## 🚀 Features

*   **Real-Time Messaging**: Built on STOMP over WebSockets for instant, full-duplex message delivery.
*   **End-to-End Encryption (E2EE)**: Messages and file attachments are securely encrypted using the WebCrypto API before they leave your browser. Only authenticated participants in the room possess the ephemeral keys to decrypt them.
*   **Modern UI**: A sleek, dark-themed responsive user interface built with React, Vite, and Tailwind CSS.
*   **Scalable Architecture**: Spring Boot backend backed by MongoDB (persistent storage) and Redis (caching and high-throughput pub/sub).
*   **Secure File Sharing**: Upload and share files within rooms securely, with chunked processing and local decryption.
*   **Robust Authentication**: JWT-based stateless authentication and secure session management.

---

## 📂 Project Directory Structure

```text
├── backend/               # Spring Boot server implementation
│   ├── src/main/java/     # Application logic (Controllers, Config, Models, Services)
│   ├── src/main/resources/# application.yml & core backend properties
│   ├── pom.xml            # Maven project object model & dependencies
│   └── Dockerfile         # Backend container build definition
├── frontend/              # Single Page Application frontend
│   ├── public/            # Static assets (images, icons)
│   ├── src/
│   │   ├── components/    # Reusable React components (UI elements, modals, chat bubbles)
│   │   ├── context/       # Global state providers (Authentication, WebSocket SocketContext)
│   │   ├── hooks/         # Custom React hooks (Health checks, dynamic state)
│   │   ├── pages/         # Full-page views (Dashboard, Room Chat, Login/Register)
│   │   ├── services/      # Axios API clients & E2EE Cryptography engines
│   │   ├── index.css      # Core tailwind directives, CSS variables, & design tokens
│   │   └── main.tsx       # SPA bootstrap entrypoint
│   ├── nginx.conf         # Production Nginx reverse proxy configuration
│   ├── package.json       # Node dependency manifests & build scripts
│   └── Dockerfile         # Frontend static serving container definition (Nginx)
├── .github/workflows/     # CI/CD GitHub Actions pipelines
├── docker-compose.yml     # Multi-container orchestration (Backend, Frontend, MongoDB, Redis)
└── ARCHITECTURE.md        # Detailed infrastructure & cryptographic documentation
```

---

## 🚀 Installation & Local Development

### Prerequisites
*   Node.js (v20 or higher)
*   Java 21+ & Maven
*   Docker Desktop (for containerized deployment)
*   MongoDB instance (local or cloud like Atlas)
*   Redis instance (local or cloud like Upstash)

### 1. Environment Configuration
Create environment files in both the frontend and backend directories.

**Backend (`backend/src/main/resources/application.yml`) overrides:**
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<username>:<password>@<cluster-url>/syncstream?retryWrites=true&w=majority
    redis:
      host: <your-redis-host>.upstash.io
      port: <redis-port>
      password: <your-redis-password>

app:
  jwt:
    secret: <your_highly_secure_base64_jwt_secret_key>
```
> [!NOTE]
> If you are running locally without cloud services, you can omit these environment overrides or point them to `localhost:27017` and `localhost:6379`.

### 2. Running the Backend Server
Navigate to the backend directory and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```

### 3. Running the Frontend Server
Open a new terminal, navigate to the frontend directory, install dependencies, and launch the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to preview the application.

---

## 📦 Production Deployment (Docker Compose)

This application is fully containerized and optimized for robust deployment using **Docker Compose** and **Nginx**.

### Nginx Routing Configuration (`frontend/nginx.conf`)
The Nginx configuration serves as the crucial reverse proxy for the entire application stack:
*   Routes `/api/*` and `/ws/*` requests directly to the internal `backend:8080` container over the Docker bridge network.
*   Serves compiled frontend static assets (`dist/`) natively on Port 80.
*   Enforces fallback routing (`try_files $uri /index.html`) to support React client-side SPA routing.

> [!IMPORTANT]
> **Relative API Proxying**
> In production, the frontend dynamically uses relative URLs (`/api/health`) instead of absolute URLs (`http://localhost:8080`). This guarantees that all cross-origin (CORS) limits are completely bypassed since the browser only communicates with the Nginx proxy on Port 80, which seamlessly tunnels traffic to the backend.

### Launching the Stack
1. Ensure Docker Desktop is running.
2. From the root directory, run:
```bash
docker compose up -d --build
```
3. Navigate to `http://localhost` in your browser.

---

## 🔄 CI/CD Workflows

SyncStream uses GitHub Actions for Continuous Integration. The pipeline automatically runs on every push and pull request to the `main` branch.

The workflow (`.github/workflows/ci.yml`) consists of two main jobs:
*   **Backend Build**: Sets up Java 21 and a temporary MongoDB/Redis service environment, runs all Spring Boot unit and integration tests, and builds the backend Docker image.
*   **Frontend Build**: Sets up Node.js 22, installs dependencies and runs unit tests (Vitest), builds the React production bundle, executes Cypress End-to-End (E2E) tests, and builds the frontend Nginx Docker image.

---

## 🔒 Cryptographic Safeguards & E2EE

### 1. End-to-End Encryption (E2EE) Guarantee
To ensure absolute privacy, the backend never sees plaintext messages or private keys. 
* Private keys are generated locally using the `WebCrypto API` and are wrapped (encrypted) symmetrically using AES-GCM derived from the user's password.
* Room keys are symmetric AES keys encrypted individually for every authorized participant's public key.

For complete documentation on the architecture and security model, please refer to the [ARCHITECTURE.md](file:///d:/ASHISH%20GITHUB/SyncStream/ARCHITECTURE.md).
