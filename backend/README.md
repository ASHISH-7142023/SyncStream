# SyncStream Backend

This is the Spring Boot backend for SyncStream.

## Requirements
- Java 21+
- Maven 3.9+
- MongoDB 7.0+
- Redis 7.0+

## Setup
1. Ensure MongoDB and Redis are running locally on their default ports.
2. Build the project using Maven: `mvn clean install`
3. Run the application: `mvn spring-boot:run`

## Architecture
- **WebSockets/STOMP**: Used for real-time chat, presence, and notifications.
- **Spring Security**: JWT-based authentication.
- **MongoDB**: Primary document store.
- **Redis**: Pub/Sub broker for multi-instance scaling.
