# JWT Authentication API

A backend authentication system built with **Node.js, Express and MongoDB**. It uses short-lived access tokens, long-lived refresh tokens stored in httpOnly cookies, and refresh token rotation.

## Features

- Register and login with bcrypt password hashing (12 salt rounds)
- Access token (15 minutes) sent in the `Authorization` header
- Refresh token (7 days) stored in an httpOnly cookie
- Refresh tokens are stored as SHA-256 hashes in the database, never as raw tokens
- Cookie hardening: `httpOnly`, `secure` (production), `sameSite: strict`, scoped `path`
- Refresh token rotation: every refresh issues a new token and invalidates the old one
- Reuse detection: a mismatched refresh token clears the stored token and forces a new login
- Protected routes through auth middleware that checks token type and user existence

## Tech Stack

Node.js, Express, MongoDB, Mongoose, jsonwebtoken, bcryptjs, cookie-parser, dotenv

## Project Structure

```
src/
├── app/app.js                  # Express app and middleware setup
├── config/
│   ├── config.js               # Environment variables
│   └── db.js                   # MongoDB connection
├── controller/auth.controller.js
├── middleware/auth.middleware.js
├── models/user.model.js
├── routes/auth.routes.js
├── utils/auth.js               # Token generate and verify helpers
└── server.js                   # Entry point
```

## Setup

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd jwt-authentication
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/jwt-auth
   ACCESS_TOKEN_SECRET=your_access_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_secret_here
   ```

   Generate strong secrets with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Start the server**

   ```bash
   node src/server.js
   ```

   The API runs at `http://localhost:3000`.

## API Endpoints

Base URL: `/api/auth`

| Method | Endpoint    | Auth                  | Description                          |
| ------ | ----------- | --------------------- | ------------------------------------ |
| POST   | `/register` | None                  | Create a new user                    |
| POST   | `/login`    | None                  | Log in and receive tokens            |
| POST   | `/refresh`  | Refresh token cookie  | Get a new access token (and rotate the refresh token) |
| GET    | `/me`       | Bearer access token   | Get the logged-in user's data        |

### Register

`POST /api/auth/register`

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "mypassword123"
}
```

**201 Created**

```json
{
  "message": "user register successfully",
  "data": { "user": { "name": "Rahul", "email": "rahul@example.com" } },
  "accessToken": "<jwt>"
}
```

The refresh token is set as an httpOnly cookie.

### Login

`POST /api/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "mypassword123"
}
```

**200 OK** returns the user data and an `accessToken`, and sets the refresh token cookie.

### Refresh Token

`POST /api/auth/refresh`

Send the request with the `refreshToken` cookie. **200 OK** returns a new `accessToken` and sets a new refresh token cookie. The old refresh token stops working.

### Get Current User

`GET /api/auth/me`

```
Authorization: Bearer <accessToken>
```

**200 OK**

```json
{
  "message": "User data is fetched...",
  "data": { "user": { "name": "Rahul", "email": "rahul@example.com" } }
}
```

## Error Responses

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Missing or invalid input, or the user already exists     |
| 401    | Invalid credentials, or a missing, expired or invalid token |
| 500    | Unexpected server error                                  |

## How the Token Flow Works

1. The user logs in and receives an access token (response body) and a refresh token (httpOnly cookie).
2. The client sends the access token with each protected request.
3. When the access token expires, the client calls `/refresh`.
4. The server checks the refresh token against the one stored in the database, issues a new pair, and saves the new refresh token.
5. If an old refresh token is reused, the server clears the stored token and the user must log in again.

## Possible Improvements

- Add a logout route that clears the cookie and the stored token
- Add rate limiting on login and register
- Add `helmet` and CORS configuration
- Add request validation with Zod or Joi

## License

MIT