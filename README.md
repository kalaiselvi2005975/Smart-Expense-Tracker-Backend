# Smart Expense Tracker Backend

A Spring Boot REST API for recording, managing, and analyzing personal expenses with JWT authentication.

## Tech Stack

- **Java 17** · **Spring Boot 3.2** · **Spring Security** · **JWT**
- **Spring Data JPA** · **Hibernate** · **MySQL** (H2 for local dev)
- **Maven**

## Features

| Area | Endpoints |
|------|-----------|
| **Auth** | Register, Login (JWT) |
| **User** | Get profile, Update profile |
| **Expenses** | CRUD, search by category/date |
| **Analysis** | Monthly total & category breakdown |
 
## Quick Start (H2 – no MySQL needed)

H2 is the **default profile** — no extra flags required:

```bash
# Windows (set JAVA_HOME if mvnw fails)
set JAVA_HOME=C:\Program Files\Java\jdk-24
mvnw.cmd spring-boot:run
```

App runs at **http://localhost:8080**

H2 console: **http://localhost:8080/h2-console**  
JDBC URL: `jdbc:h2:mem:expense_tracker` · User: `sa` · Password: *(empty)*

## MySQL Setup

1. Install MySQL and create database (optional – auto-created):
   ```sql
   CREATE DATABASE expense_tracker;
   ```
2. Update `src/main/resources/application-mysql.properties` with your credentials.
3. Run with the MySQL profile:
   ```bash
   mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

## API Reference

### Authentication (public)

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{ "name", "email", "password" }` |
| POST | `/api/auth/login` | `{ "email", "password" }` |

**Response:** `{ "token", "type": "Bearer", "userId", "name", "email" }`

Use header for protected routes: `Authorization: Bearer <token>`

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Current user info |
| PUT | `/api/users/profile` | Update name/password |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Add expense |
| GET | `/api/expenses` | List all |
| GET | `/api/expenses?category=Food` | Filter by category |
| GET | `/api/expenses?startDate=2026-06-01&endDate=2026-06-30` | Filter by date range |
| GET | `/api/expenses/{id}` | Get one |
| PUT | `/api/expenses/{id}` | Update |
| DELETE | `/api/expenses/{id}` | Delete |
| GET | `/api/expenses/summary/monthly?year=2026&month=6` | Monthly summary |

### Example: Register & Add Expense

```json
POST /api/auth/register
{
  "name": "Kalaiselvi",
  "email": "kalai@gmail.com",
  "password": "password123"
}

POST /api/expenses
Authorization: Bearer <token>
{
  "category": "Food",
  "amount": 250.00,
  "date": "2026-06-19",
  "description": "Lunch"
}
```

### Monthly Summary Response

```json
{
  "year": 2026,
  "month": 6,
  "totalAmount": 350.00,
  "categoryBreakdown": [
    { "category": "Food", "amount": 250.00 },
    { "category": "Travel", "amount": 100.00 }
  ]
}
```

## Postman

Import the endpoints above. Flow:

1. Register → copy `token`
2. Set collection variable `token` and use `Authorization: Bearer {{token}}`
3. Test expense CRUD and summary APIs

## Build

```bash
# Windows
mvnw.cmd clean package
java -jar target/smart-expense-tracker-1.0.0.jar
```

## Project Structure

```
src/main/java/com/expensetracker/
├── controller/     REST endpoints
├── service/        Business logic
├── repository/     JPA repositories
├── entity/         User, Expense
├── dto/            Request/response objects
├── security/       JWT + Spring Security
└── exception/      Global error handling
```

.
