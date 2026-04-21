# Authorization Template (Node.js + Express + MongoDB + JWT)

If you want auth up and running without rewriting the same boilerplate every time, this repo is for you.

It gives you:

- Register
- Login
- Logout
- JWT access + refresh token flow
- Cookie-based auth
- Cloudinary upload support for avatar/cover image

Use it as a starter, then customize based on your project.

## Quick Feature List

- Auth routes already wired (`register`, `login`, `logout`)
- Password hashing with `bcrypt`
- JWT token generation + verification
- Uploads via `multer`
- Cloudinary integration
- MongoDB with Mongoose

## Tech

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcrypt
- multer
- cloudinary
- cookie-parser
- cors
- dotenv

## Project Layout

```text
src/
   app.js
   index.js
   constants.js
   controllers/
      user.controller.js
   db/
      db.js
   middlewares/
      auth.middleware.js
      multer.middleware.js
   models/
      user.model.js
      video.model.js
   routes/
      user.routes.js
   utils/
      apiError.js
      apiResponse.js
      asyncHandler.js
      cloudinary.js
public/
   uploads/
```

## Before You Start

You need:

1. Node.js (18+ recommended)
2. MongoDB (local or Atlas)
3. Cloudinary account

## Setup

Install packages:

```bash
npm install
```

Or install all core dependencies in one go:

```bash
npm i express mongoose dotenv cors cookie-parser jsonwebtoken bcrypt multer cloudinary
```

Run the app:

```bash
npm start
```

## Environment Setup

Copy `.env.sample` to `.env`, then fill values.

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

MONGO_URI=your_mongodb_uri
MONGO_DB_NAME=your_database_name

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=10d
```

What matters here:

- `NODE_ENV=production` enables production-safe cookie behavior.
- `CORS_ORIGIN` should match your frontend URL.

Generate strong secrets quickly:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use different values for access and refresh token secrets.

## Cloudinary Setup

1. Open Cloudinary dashboard.
2. Copy `cloud_name`, `api_key`, `api_secret`.
3. Put them in `.env`.

Flow in this project:

1. Multer stores files in `public/uploads`.
2. Files are uploaded to Cloudinary.
3. Local temp files are deleted.
4. User document stores Cloudinary URLs.

## MongoDB Setup

Atlas:

1. Create cluster
2. Create DB user
3. Allow network access
4. Paste URI in `MONGO_URI`

Local:

```env
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=auth_template
```

## API Base URL

```text
http://localhost:5000/api/v1/users
```

## Routes

### Register

- `POST /api/v1/users/register`
- Content type: `multipart/form-data`
- Required text fields:
  - `fullName` (or `fullname` or `name`)
  - `email`
  - `username`
  - `password`
- Required file fields:
  - `avatar`
  - `coverPhoto`

### Login

- `POST /api/v1/users/login`
- Content type: `application/json`
- Required:
  - `password`
  - one of `email` or `username`

Example body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

On success:

- Returns `accessToken` + `refreshToken`
- Sets `httpOnly` cookies
- In production, secure cookie settings are applied

### Logout

- `POST /api/v1/users/logout`
- Protected route

Send token using either:

- Cookie `accessToken`
- Header `Authorization: Bearer <token>`

On success:

- Refresh token is removed from DB
- Auth cookies are cleared

## Postman Quick Walkthrough

Create env vars in Postman:

- `baseUrl = http://localhost:5000/api/v1/users`
- `accessToken =` (empty at first)

### 1) Register request

- `POST {{baseUrl}}/register`
- Body -> `form-data`
- Add fields:
  - `fullName`, `email`, `username`, `password`
  - `avatar` file
  - `coverPhoto` file

### 2) Login request

- `POST {{baseUrl}}/login`
- Body -> `raw` -> JSON

```json
{
  "email": "testuser@example.com",
  "password": "StrongPassword123"
}
```

Optional tests tab script to save token:

```javascript
const jsonData = pm.response.json();
if (jsonData?.data?.accessToken) {
  pm.environment.set("accessToken", jsonData.data.accessToken);
}
```

### 3) Logout request

- `POST {{baseUrl}}/logout`
- Either use cookies from login
- Or set header `Authorization: Bearer {{accessToken}}`

## Common Errors (and quick fixes)

1. `All fields are required`
   - One of the required register fields is missing.
2. `Avatar and cover photo are required`
   - Upload both file fields.
3. `Unauthorized, token is missing`
   - Send cookie or bearer token.
4. `User already exists`
   - Use another email/username.

## How It Works (Short Version)

Register flow:

1. Validate fields
2. Upload images to Cloudinary
3. Create user
4. Password hash via pre-save hook

Login flow:

1. Validate credentials
2. Compare password with bcrypt
3. Generate access + refresh token
4. Save refresh token
5. Send response + cookies

Logout flow:

1. Verify access token
2. Remove refresh token from DB
3. Clear cookies

## Before Production

Do these before going live:

1. Set real `CORS_ORIGIN`
2. Run behind HTTPS
3. Tune token expiry values
4. Add centralized error middleware
5. Add request validation (`zod`/`joi`)
6. Add rate limiting + `helmet`
7. Replace `console.log` with proper logger
8. Add refresh-token rotation endpoint

## Reuse In Other Projects

Copy these folders into your backend:

1. `src/controllers`
2. `src/routes`
3. `src/models`
4. `src/middlewares`
5. `src/utils`

Then wire routes, set env values, and test register -> login -> logout.

## Author

Arghya
