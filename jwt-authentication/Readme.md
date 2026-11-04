```md
# JWT Authentication API

A simple and secure authentication backend built with Node.js, Express.js, MongoDB, and JWT.

## Features

- User registration
- User login
- JWT-based authentication
- Protected routes using middleware
- Logout functionality
- Profile retrieval and update
- User deletion
- Password hashing with bcrypt
- MongoDB integration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- cookie-parser
- CORS

## Project Structure

```bash
jwt-authentication/
├── .env
├── .gitignore
├── package.json
├── README.md
├── src/
│   ├── server.js
│   ├── app/
│   │   └── app.js
│   ├── config/
│   │   └── config.js
│   ├── controller/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── utils/
│       └── auth.js
```

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- MongoDB running locally
- npm installed

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/jwt-authentication.git
cd jwt-authentication
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jwt-auth
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
```

4. Start the server:

```bash
npm run dev
```

## API Endpoints

### Register User

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login User

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

### Get Profile

```http
GET /api/auth/profile
```

Requires JWT token.

## How JWT Works

1. User sends login credentials.
2. Server validates the user.
3. Server creates a JWT token.
4. Token is sent back to the client.
5. Client sends token for protected routes.
6. Middleware verifies the token before granting access.

## Security

- Passwords are hashed before saving.
- JWT secret is stored in environment variables.
- Token verification is done in middleware.
- Cookies are used for token handling.
