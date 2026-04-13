# Vaultify

Distributed auth backend handling high-throughput API calls with **JWT authentication**, **BCrypt encryption**, and **Role-Based Access Control (RBAC)**.

## Stack

`Spring Boot 3.4` `Spring Security` `Spring Data JPA` `MySQL` `Docker` `JWT (JJWT)`

## Features

- **JWT Authentication** — stateless Bearer token auth, 24h expiry
- **BCrypt Password Encoding** — all passwords hashed with BCrypt before storage
- **RBAC** — three roles with fine-grained HTTP method access control
  - `ROLE_EMPLOYEE` — read access (GET)
  - `ROLE_MANAGER` — read + write access (GET, POST, PUT)
  - `ROLE_ADMIN` — full access including delete (GET, POST, PUT, DELETE)
- **Global Exception Handling** — structured JSON error responses
- **Input Validation** — `@Valid` on all request bodies

## API Endpoints

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Users (secured)
| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users` | EMPLOYEE | List all users |
| GET | `/api/users/{id}` | EMPLOYEE | Get user by ID |
| POST | `/api/users` | MANAGER | Create a user |
| PUT | `/api/users/{id}` | MANAGER | Update a user |
| DELETE | `/api/users/{id}` | ADMIN | Delete a user |

## Running Locally

### With Docker (recommended)

```bash
docker-compose up --build
```

App will be available at `http://localhost:8080`.

### Without Docker

1. Start a local MySQL instance on port `3306`
2. Update `src/main/resources/application.properties` with your credentials
3. Run:

```bash
mvn spring-boot:run
```

## Example Requests

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

**Access a secured endpoint:**
```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <your_token_here>"
```
