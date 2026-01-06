Project Overview

Project name: YouTube Clone (MERN – Backend Focused)

What it does:
A YouTube-like platform where users can upload videos, watch videos, like, comment, subscribe to channels, and maintain watch history. Built to practice real-world backend architecture and frontend integration.

Tech Stack

Frontend

React (Vite)

React Router

React Hook Form

Zustand (auth state)

SCSS (modular, component-based)

Backend

Node.js

Express

MongoDB + Mongoose

JWT authentication

Multer (file uploads)

Cloudinary (video & image storage)

Database

MongoDB (collections: users, videos, comments, likes, subscriptions, playlists, tweets)

Auth

JWT (access + refresh tokens)

HttpOnly cookies

Auth middleware (verifyJWT)

Hosting

Backend: Local (planned deployment later)

Frontend: Local (Vite dev server)

Current Status
✅ Implemented (Backend)

User authentication (register, login, logout, refresh)

Video CRUD

Video publish/unpublish

View count increment

Watch history (most recent first, capped)

Likes (video, comment, tweet)

Subscriptions (toggle subscribe/unsubscribe)

Subscriber count

Like count

Comments (add, edit, delete)

Playlists

Channel dashboard stats

Aggregation pipelines for counts & relationships

Proper error handling (ApiError, asyncHandler)

✅ Implemented (Frontend)

Login flow

Protected routes

Home page (video list)

Video details page

Play video

Like / Unlike

Subscribe / Unsubscribe

Display counts (likes, subscribers, views)

Comments section

Fetch comments

Add comment

Delete comment

Zustand-based auth persistence

SCSS setup with main.scss

⚠️ Pending / Known Gaps

Channel page (/c/:username)

Watch history UI

Edit comment UI polish

Optimistic UI edge cases (rapid clicking)

Better error UI (currently basic)

Responsive design

Deployment

API Contracts (Key Endpoints)
Auth

POST /api/v1/users/login – login

POST /api/v1/users/logout – logout

GET /api/v1/users/current – get current user

Videos

GET /api/v1/videos – get all published videos

POST /api/v1/videos – upload video

GET /api/v1/videos/:videoId – get video details
Returns: video, isLiked, isSubscribed, likesCount, subscriberCount

PATCH /api/v1/videos/toggle/publish/:videoId – publish/unpublish

Likes

POST /api/v1/likes/toggle/v/:videoId

POST /api/v1/likes/toggle/c/:commentId

Subscriptions

POST /api/v1/subscriptions/c/:channelId – toggle subscription

GET /api/v1/subscriptions/u/:subscriberId

Comments

GET /api/v1/comments/:videoId

POST /api/v1/comments/:videoId

PATCH /api/v1/comments/c/:commentId

DELETE /api/v1/comments/c/:commentId

Frontend Structure
Pages

Login.jsx

Home.jsx

VideoDetails.jsx

Components

VideoCard.jsx

VideoPlayer.jsx

CommentsSection.jsx

ProtectedRoute.jsx

State

auth.store.js (Zustand)

user

setUser

clearUser

Styles
styles/
├── base/
├── layout/
├── components/
└── main.scss

Known Decisions

Backend-first architecture (API is source of truth)

Counts (likes, subscribers) always come from backend

No frontend-derived state for auth or permissions

Optimistic UI only after backend confirmation

SCSS over Tailwind to learn structural styling

No overengineering (no React Query, no GraphQL)

Next Tasks
Short-term (Next Sessions)

Channel page (/c/:username)

Channel info

Subscribe button

Channel videos list

Watch History page

Fetch from backend

Reuse VideoCard

UI polish

Disable buttons during requests

Better loading / error states

Refactor

Small cleanup of handlers

Remove redundant props

Long-term

Responsive layout

Deployment

Performance optimizations

Optional: React Query / caching layer

Notes for Future You

Backend logic is correct — don’t rewrite it unnecessarily

Aggregation pipelines are intentional, not overkill

State bugs usually mean backend contract mismatch

Always refresh-safe features first

This README is enough context to continue immediately in a new chat.

When you start the new chat, say something like:

“I’m continuing a MERN YouTube clone project. Here’s the README.md.”

And you’ll be fully back in flow.