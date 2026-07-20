# DocEditor - Real-Time Collaborative Editor

A secure, full-stack, real-time collaborative document editor built with React, Node.js, Socket.IO, and MongoDB.

## Features
- **Authentication**: Secure registration and login with JWT.
- **Unique IDs**: Every user gets a unique `username#tag` (e.g., `Alice#4821`).
- **Real-Time Collaboration**: Edit documents simultaneously with others, powered by **Socket.IO**.
- **Role-Based Access**: 
  - **Owner**: Full control, can share and delete.
  - **Editor**: Can modify text and view changes live.
  - **Viewer**: Read-only access to sharing sessions.
- **Rich Text Editing**: Powered by TipTap (Bold, Italic, Underline, etc.).
- **Auto-Save**: Changes are saved automatically every 5 seconds.

## Project Structure
- `/backend`: Node.js + Express + Mongoose + Socket.IO
- `/frontend`: React + Vite + TipTap + Socket.IO-Client

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally on `mongodb://localhost:27017/doc_editor`)

## Running Locally

### 1. Simple Run (Windows)
If you are on Windows, you can use the helper batch files to bypass PowerShell script restrictions:
- Double-click `run_backend.bat` 
- Double-click `run_frontend.bat`

### 2. Manual Setup

**Backend:**
```bash
cd backend
npm install
npm start
```
*Note: Make sure your `backend/.env` has a `JWT_SECRET` and `MONGODB_URI`.*

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## How to Collaborate
1. Register an account and create a document.
2. Click the **Share** button in the header.
3. Enter the `email` or `username#tag` of another registered user.
4. Open the document in another browser window (logged in as the other user).
5. Watch as edits sync in real-time between windows!
