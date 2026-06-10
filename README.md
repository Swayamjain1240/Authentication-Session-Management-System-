# Authentication & Session Management System

A secure backend authentication system built using Node.js, Express.js, MongoDB, JWT, and Refresh Token Rotation. The project implements user authentication, session management, access token renewal, and multi-device logout functionality.

## Features

* User Registration
* User Login
* JWT-based Authentication
* Access Token & Refresh Token Mechanism
* Refresh Token Rotation
* Session Management
* Get Current User Profile
* Logout from Current Device
* Logout from All Devices
* Secure HTTP-Only Cookies
* Password Hashing with bcrypt
* Refresh Token Hashing using SHA-256

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt
* Cookie Parser
* SHA-256 Token Hashing

### Utilities

* Morgan
* dotenv

---

## Project Structure

```text
authentication/
│
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── model/
│   │   ├── user.model.js
│   │   └── session.model.js
│   │
│   ├── routes/
│   │   └── auth.route.js
│   │
│   └── app.js
│
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/authentication-system.git
cd authentication-system
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory.

```env
MONGO_DB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### Run Application

```bash
npm start
```

or

```bash
npm run dev
```

Server will run on:

```text
http://localhost:3000
```

---

## API Endpoints

### Register User

```http
POST /api/auth/register
```

#### Request Body

```json
{
  "username": "swayam",
  "email": "swayam@gmail.com",
  "password": "password123"
}
```

---

### Login User

```http
POST /api/auth/login
```

#### Request Body

```json
{
  "email": "swayam@gmail.com",
  "password": "password123"
}
```

---

### Get Current User

```http
GET /api/auth/get-me
```

#### Headers

```text
Authorization: Bearer <access_token>
```

---

### Refresh Access Token

```http
GET /api/auth/refresh-token
```

Uses Refresh Token stored inside HTTP-only cookies.

---

### Logout Current Device

```http
GET /api/auth/logout
```

Revokes the current session and removes refresh token cookie.

---

### Logout From All Devices

```http
GET /api/auth/logout-all
```

Revokes all active sessions associated with the user account.

---

## Security Features

* Passwords hashed using bcrypt
* Refresh Tokens hashed before database storage
* HTTP-only Cookies
* JWT Access Tokens
* Session Revocation
* Refresh Token Rotation
* Secure Authentication Flow
* Multi-Device Session Management

---

## Future Improvements

* Role-Based Access Control (RBAC)
* Email Verification
* Forgot Password Functionality
* Rate Limiting
* Two-Factor Authentication (2FA)
* OAuth Integration (Google/GitHub Login)

---

## Author

Swayam Jain

Computer Science Student | Backend Developer

---

If you found this project useful, consider giving it a star on GitHub.
