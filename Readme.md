# Video Platform Backend API

A RESTful backend API for a YouTube-like platform built with Node.js, Express, MongoDB, JWT authentication, and Cloudinary for media uploads.

Base path: `/api/v1`

## Tech Stack

- Node.js (ES Modules)
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (media uploads)
- Multer (file handling)

## Features

### Authentication
- User registration & login
- JWT-based authentication
- Protected routes (JWT verified via cookie or `Authorization` header)

### Video Management
- Upload videos with thumbnails
- Publish / unpublish videos
- Get videos with pagination & sorting
- View count tracking

### User Interaction
- Like / unlike videos
- Comment on videos
- Subscribe / unsubscribe to channels
- Watch history tracking

### Playlists
- Create playlists
- Add/remove videos
- Fetch user playlists

### Dashboard
- Total views
- Total videos
- Subscribers count

## Project Structure

```
src/
├── controllers/       # Request handlers
├── models/            # Mongoose schemas
├── routes/            # API routes
├── middlewares/       # Auth + upload middleware
├── utils/             # Helpers (ApiError, ApiResponse, asyncHandler, cloudinary)
├── db/                # Mongo connection
├── app.js             # Express app (middlewares + route mounting)
└── index.js           # Server entry (connect DB + listen)
public/
└── temp/              # Multer temporary uploads (auto-cleaned after Cloudinary upload)
```

## Getting Started

### Prerequisites

- Node.js (recommended: 18+)
- MongoDB connection string (Atlas or local)
- Cloudinary account (cloud name, API key, API secret)

### Install

```bash
npm install
```

### Run (dev)

```bash
npm run dev
```

The server listens on `PORT` (defaults to `8000`).

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=8000

# CORS
# Example: http://localhost:5173
CORS_ORIGIN=http://localhost:3000

# Database
# IMPORTANT: The app appends /videotube automatically (see src/constants.js)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

## Authentication Notes

Protected routes use `verifyJWT` and accept the access token from either:

- Cookie: `accesstoken`
- Header: `Authorization: Bearer <accessToken>`

Login sets cookies named `accesstoken` and `refreshtoken`.

## API Routes (high-level)

All routes are mounted under `/api/v1` in [src/app.js](src/app.js).

### Users (`/api/v1/users`)

- `POST /register` (multipart/form-data)
	- Fields: `fullname`, `username`, `email`, `password`
	- Files: `avatar` (required), `coverImage` (optional)
- `POST /login`
- `POST /logout` (protected)
- `POST /refresh-token`
- `POST /change-password` (protected)
- `GET /current-user` (protected)
- `PATCH /update-account` (protected)
- `PATCH /avatar` (protected, multipart/form-data)
	- File: `avatar`
- `PATCH /cover-image` (protected, multipart/form-data)
	- File: `coverImage`
- `GET /c/:username` (protected)
- `GET /history` (protected)

### Videos (`/api/v1/videos`) (protected in current code)

Note: [src/routes/video.routes.js](src/routes/video.routes.js) applies `verifyJWT` to the whole router.

- `GET /` (pagination + search)
	- Query: `page`, `limit`, `query`, `sortBy` (`createdAt|views`), `sortType` (`asc|desc`), `userId`
- `POST /` (multipart/form-data)
	- Files: `videoFile`, `thumbnail`
	- Fields: `title`, `description`
- `GET /:videoId`
- `PATCH /:videoId` (multipart/form-data)
	- File: `thumbnail` (optional)
	- Fields: `title` (optional), `description` (optional)
- `DELETE /:videoId`
- `PATCH /toggle/publish/:videoId`

### Other Routers (mounted)

- `/api/v1/healthcheck`
- `/api/v1/tweets`
- `/api/v1/subscriptions`
- `/api/v1/comments`
- `/api/v1/likes`
- `/api/v1/playlist`
- `/api/v1/dashboard`

## File Upload Flow

- Multer saves uploads temporarily to `public/temp`.
- After upload succeeds, the local temp file is deleted in [src/utils/cloudinary.js](src/utils/cloudinary.js).

## Known Gaps / TODOs

- When updating avatar/coverImage/thumbnail, old Cloudinary assets are not deleted yet.
	- See TODO in the user controller and the video update flow.
