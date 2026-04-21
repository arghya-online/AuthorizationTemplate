# Authorization Template (Node.js + Express + MongoDB + JWT)

This repository is a reusable authentication and authorization starter that you can plug into any Node.js backend project.

It already includes:

- User registration
- User login
- User logout
- Access token + refresh token flow
- Cookie-based auth support
- Avatar and cover photo upload using Cloudinary
- MongoDB user persistence with Mongoose

If you want a ready auth base instead of writing auth from scratch in every project, this template is built for that.

## What This Template Gives You

- Pre-built auth API routes: `register`, `login`, `logout`
- Password hashing with `bcrypt`
- JWT generation and verification with `jsonwebtoken`
- File upload handling with `multer`
- Cloud image storage via Cloudinary
- Clean async error-handling helper
- Scalable folder architecture for controllers, routes, models, middlewares, and utils

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Bcrypt
- Multer
- Cloudinary
- Cookie Parser
- CORS
- Dotenv

## Project Structure

```text
src/
	app.js                  # Express app config, middleware, routes
	index.js                # Server entry point, env setup, DB connect
	constants.js            # Env-based constants
	controllers/
		user.controller.js    # register, login, logout logic
	db/
		db.js                 # MongoDB connection logic
	middlewares/
		auth.middleware.js    # JWT verification middleware
		multer.middleware.js  # File upload config (local temporary storage)
	models/
		user.model.js         # User schema + JWT/password model methods
		video.model.js        # currently empty placeholder
	routes/
		user.routes.js        # User route declarations
	utils/
		apiError.js
		apiResponse.js
		asyncHandler.js
		cloudinary.js
public/
	uploads/                # Temporary upload storage before Cloudinary upload
```

## Prerequisites

Install these before running:

1. Node.js (recommended: LTS, v18+)
2. MongoDB (Atlas cluster or local MongoDB)
3. Cloudinary account (free tier works)

## Installation

From the project root:

```bash
npm install
```

Run in development:

```bash
npm start
```

## Environment Setup (`.env.sample` -> `.env`)

This project already ships with a `.env.sample` file.

### Step 1: Copy `.env.sample`

Create a `.env` file in the project root and copy all keys from `.env.sample`.

### Step 2: Fill all values

Template keys:

```env
PORT=5000
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

### How to Generate Strong JWT Secrets

Use long random strings (at least 32 characters).

Example (Node.js one-liner):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use one generated value for `ACCESS_TOKEN_SECRET` and another different one for `REFRESH_TOKEN_SECRET`.

## Cloudinary Setup (Detailed)

1. Create/sign in to Cloudinary.
2. Open Dashboard.
3. Copy these values:
   - Cloud name
   - API key
   - API secret
4. Put them in your `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

How it works in this template:

- Files are uploaded temporarily to `public/uploads` by Multer.
- Then `uploadToCloudinary()` uploads them to Cloudinary.
- Local temp files are deleted after upload (or on failure).
- User document stores Cloudinary URLs (`avatar`, `coverPhoto`).

## MongoDB Setup (Detailed)

### Option A: MongoDB Atlas

1. Create cluster.
2. Create DB user.
3. Add network access IP (`0.0.0.0/0` for dev, restricted IP for production).
4. Copy connection string.
5. Set `MONGO_URI` in `.env`.

### Option B: Local MongoDB

Use:

```env
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=auth_template
```

Note: current DB connector uses `MONGO_URI` directly to connect.

## Run the Server

```bash
npm start
```

Default route prefix:

```text
/api/v1/users
```

Example base URL:

```text
http://localhost:5000/api/v1/users
```

## API Endpoints

### 1) Register User

- Method: `POST`
- Route: `/api/v1/users/register`
- Content-Type: `multipart/form-data`
- Required text fields:
  - `fullName` (or `fullname` or `name`)
  - `email`
  - `username`
  - `password`
- Required file fields:
  - `avatar` (1 file)
  - `coverPhoto` (1 file)

Success response: `201 Created`

### 2) Login User

- Method: `POST`
- Route: `/api/v1/users/login`
- Content-Type: `application/json`
- Required fields:
  - `password`
  - one of `email` or `username`

Success response: `200 OK`

Behavior:

- Generates `accessToken` and `refreshToken`
- Returns both in response body
- Also sets cookies (`accessToken`, `refreshToken`)

Example request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### 3) Logout User

- Method: `POST`
- Route: `/api/v1/users/logout`
- Protected route (requires valid access token)

How token can be sent:

- Cookie: `accessToken`
- Header: `Authorization: Bearer <token>`

Success response: `200 OK`

Behavior:

- Clears refresh token in database
- Clears auth cookies from browser

## Postman Tutorial (Step by Step)

Use this section to test the entire auth flow quickly in Postman.

### Create a Postman Environment

Create environment variables:

- `baseUrl` = `http://localhost:5000/api/v1/users`
- `accessToken` = (leave empty initially)

### A) Register Request (multipart/form-data)

1. Create request: `POST {{baseUrl}}/register`
2. Go to Body -> `form-data`
3. Add text fields:
   - `fullName`: `Test User`
   - `email`: `testuser@example.com`
   - `username`: `testuser`
   - `password`: `StrongPassword123`
4. Add file fields:
   - key `avatar` -> type `File` -> choose image
   - key `coverPhoto` -> type `File` -> choose image
5. Click Send.

Expected result:

- Status `201`
- User object returned (without password and refresh token)

### B) Login Request (application/json)

1. Create request: `POST {{baseUrl}}/login`
2. Go to Body -> `raw` -> JSON
3. Use body:

```json
{
  "email": "testuser@example.com",
  "password": "StrongPassword123"
}
```

4. Click Send.

Expected result:

- Status `200`
- Response includes `accessToken` and `refreshToken`
- Cookies include `accessToken` and `refreshToken`

Optional test script in Postman (save access token automatically):

```javascript
const jsonData = pm.response.json();
if (jsonData?.data?.accessToken) {
  pm.environment.set("accessToken", jsonData.data.accessToken);
}
```

### C) Logout Request (Protected)

You can test logout in either way:

#### Option 1: Cookie-based (same Postman session)

1. Create request: `POST {{baseUrl}}/logout`
2. If cookies from login are present, just click Send.

#### Option 2: Bearer token header

1. Create request: `POST {{baseUrl}}/logout`
2. Add header:
   - `Authorization: Bearer {{accessToken}}`
3. Click Send.

Expected result:

- Status `200`
- Message confirms logout
- Auth cookies are cleared

### Common Postman Errors and Fixes

1. `400 All fields are required`
   - Missing one of: `fullName/fullname/name`, `email`, `username`, `password`.
2. `400 Avatar and cover photo are required`
   - You must upload both `avatar` and `coverPhoto` file fields.
3. `401 Unauthorized, token is missing`
   - Send cookie from login request or set `Authorization` header.
4. `User already exists`
   - Try different `email` or `username`.

## Auth Flow Tutorial (How It Works Internally)

### Registration Flow

1. Request reaches `user.routes.js` register route.
2. Multer stores uploaded files in `public/uploads`.
3. Controller validates all fields and checks duplicate user.
4. Files are uploaded to Cloudinary.
5. User is created in MongoDB.
6. Password is hashed in schema pre-save hook.
7. Response is returned without password and refresh token.

### Login Flow

1. Controller validates input (`password` + `email` or `username`).
2. User is found in MongoDB.
3. Password is compared using bcrypt.
4. Access token + refresh token are generated from model methods.
5. Refresh token is saved in DB.
6. Tokens are returned and cookies are set.

### Logout Flow

1. `verifyJWT` middleware validates access token.
2. Controller clears stored refresh token in DB.
3. Controller clears auth cookies.
4. Logout success response is sent.

## What You Should Customize Before Using in Production

This template works for local/dev use, but you should update the following before production:

1. CORS origin
   - In `src/app.js`, replace hardcoded `http://localhost:3000` with your frontend origin(s).
2. Secure cookie settings
   - Set `secure: true` in production (HTTPS required).
   - Add `sameSite` policy explicitly.
3. JWT expiry policy
   - Tune `ACCESS_TOKEN_EXPIRES_IN` and `REFRESH_TOKEN_EXPIRES_IN` to your security requirements.
4. Error middleware
   - Add centralized Express error handler for consistent API error responses.
5. Validation
   - Add stronger input validation/sanitization (for example with `zod` or `joi`).
6. Logging
   - Replace `console.log` with structured logger (`pino`/`winston`).
7. Rate limiting and security headers
   - Add `express-rate-limit` and `helmet`.
8. Token refresh endpoint
   - Implement refresh token rotation endpoint for full auth lifecycle.

## Common Integration Notes

- Frontend must send credentials for cookie-based auth:
  - `fetch(..., { credentials: 'include' })`
  - or Axios with `withCredentials: true`
- Register endpoint requires `multipart/form-data` because of avatar/cover photo files.
- Ensure `.env` exists before running `npm start`.

## Quick Test Checklist

1. Start server.
2. Call register endpoint with form-data + two image files.
3. Call login endpoint with email/username + password.
4. Confirm cookies are set.
5. Call protected logout endpoint with valid token.
6. Confirm cookies are cleared and refresh token removed.

## Installed Core Packages

- `express`
- `mongoose`
- `dotenv`
- `cors`
- `cookie-parser`
- `jsonwebtoken`
- `bcrypt`
- `multer`
- `cloudinary`

These are already listed in `package.json`, so `npm install` is enough.

## Reusing This Template in Another Project

If you want to use this auth template in a new backend:

1. Copy `src/controllers`, `src/routes`, `src/models`, `src/middlewares`, `src/utils`, and DB bootstrap files.
2. Keep the same env keys (or update references consistently).
3. Mount user routes in your app (`/api/v1/users`).
4. Connect to your MongoDB.
5. Configure Cloudinary.
6. Test register -> login -> logout flow.

## Author

Arghya
