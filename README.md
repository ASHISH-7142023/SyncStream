# SyncStream

SyncStream is a real-time, highly scalable, and secure team communication platform. Designed for high performance and seamless interaction, SyncStream features real-time messaging, end-to-end encryption (E2EE), WebSocket integrations, and an intuitive modern UI.

## 🚀 Features

- **Real-Time Messaging**: Built on STOMP over WebSockets for instant message delivery.
- **End-to-End Encryption (E2EE)**: Messages and file attachments are securely encrypted using WebCrypto API before they leave your browser. Only participants in the room can decrypt them.
- **Modern UI**: A sleek, dark-themed responsive user interface built with React, Vite, and Tailwind CSS.
- **Scalable Architecture**: Spring Boot backend backed by MongoDB (persistent storage) and Redis (caching and pub/sub).
- **Secure File Sharing**: Upload and share files within rooms securely.
- **Robust Authentication**: JWT-based authentication and secure session management.
- **Dockerized Deployment**: A multi-container Docker Compose setup orchestrated with Nginx for reverse proxying and load balancing.

## 🛠️ Technology Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- Axios, React Router, STOMPjs
- WebCrypto API for E2EE

**Backend**
- Java 21 & Spring Boot 3
- Spring Security (JWT)
- Spring WebSocket (STOMP)
- Spring Data MongoDB & Redis

**Infrastructure**
- MongoDB Atlas (Database)
- Upstash Redis (Caching & Pub/Sub)
- Nginx (Reverse Proxy)
- Docker & Docker Compose

## 📦 Local Development Setup

### Prerequisites
- Node.js (v20+)
- Java 21+ & Maven
- Docker Desktop
- MongoDB instance (or Atlas URI)
- Redis instance (or Upstash URI)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/SyncStream.git
cd SyncStream
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/src/main/resources/` (or update `application.yml`) and `frontend/.env` with your respective credentials.

*Backend (`application.yml` overrides)*:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<user>:<pass>@<cluster>/syncstream
    redis:
      host: <redis-host>
      port: 6379
      password: <redis-password>
app:
  jwt:
    secret: <your_secure_jwt_secret>
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🐳 Docker Deployment (Production Ready)

SyncStream is fully containerized and can be spun up using Docker Compose.

1. Ensure Docker Desktop is running.
2. From the root directory, run:
```bash
docker compose up -d --build
```
3. Navigate to `http://localhost` in your browser. Nginx will handle routing to the static frontend and proxying API/WebSocket requests to the backend container.

## 🔄 CI/CD Workflows

SyncStream uses GitHub Actions for Continuous Integration. The pipeline automatically runs on every push and pull request to the `main` branch.

The workflow (`.github/workflows/ci.yml`) consists of two main jobs:
- **Backend Build**:
  - Sets up Java 21 and a temporary MongoDB/Redis service environment.
  - Runs all Spring Boot unit and integration tests.
  - Builds the backend Docker image.
- **Frontend Build**:
  - Sets up Node.js 22.
  - Installs dependencies and runs unit tests (Vitest).
  - Builds the React production bundle.
  - Runs Cypress End-to-End (E2E) tests.
  - Builds the frontend Nginx Docker image.

## 🔒 Architecture & Security

SyncStream employs a robust security model:
- **E2EE**: A master wrapping key is derived from user credentials to protect private keys. Public keys are shared to exchange symmetric room keys.
- **Nginx Proxy**: Hides backend topology and handles request routing securely.
- **CORS**: Correctly configured to allow origin sharing securely.

For more details on the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📄 License
This project is licensed under the MIT License.
