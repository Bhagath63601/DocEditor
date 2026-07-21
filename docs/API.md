# API Specification - DocEditor

This specification documents the REST API endpoints and WebSocket channels for the DocEditor application.

---

## 🔒 Authentication & Headers

All REST API requests (except public document retrieval) must include a valid Clerk authentication token in the HTTP header:

```http
Authorization: Bearer <CLERK_JWT_TOKEN>
```

---

## 📄 REST Endpoints

### 1. Fetch Owned Documents
Retrieve a list of documents owned by the authenticated user.

* **URL**: `/documents`
* **Method**: `GET`
* **Auth Required**: Yes
* **Response**: `200 OK`
  ```json
  [
    {
      "_id": "60d5ec4b8f1b2c3d4e5f6g7h",
      "title": "Project Design Document",
      "content": "",
      "owner": "user_12345abcdef",
      "collaborators": [],
      "shareToken": "e7b8c9d0...",
      "linkAccess": "none",
      "createdAt": "2026-07-20T12:00:00.000Z",
      "updatedAt": "2026-07-20T12:30:00.000Z"
    }
  ]
  ```

---

### 2. Fetch Shared Documents
Retrieve a list of documents shared with the authenticated user.

* **URL**: `/documents/shared`
* **Method**: `GET`
* **Auth Required**: Yes
* **Response**: `200 OK` (Enriched with owner names and collaborator roles)
  ```json
  [
    {
      "_id": "60d5ec4b8f1b2c3d4e5f6aaa",
      "title": "Marketing Strategy Guidelines",
      "content": "",
      "owner": "user_98765xyz",
      "collaborators": [
        {
          "userId": "user_12345abcdef",
          "identifier": "user@example.com",
          "role": "editor"
        }
      ],
      "shareToken": "d4e5f6g7...",
      "linkAccess": "viewer",
      "ownerName": "John Doe",
      "userRole": "Editor",
      "createdAt": "2026-07-18T10:00:00.000Z",
      "updatedAt": "2026-07-20T11:15:00.000Z"
    }
  ]
  ```

---

### 3. Create Document
Create a new blank document.

* **URL**: `/documents`
* **Method**: `POST`
* **Auth Required**: Yes
* **Request Body**: None (Creates document with title "Untitled Document" by default)
* **Response**: `201 Created`
  ```json
  {
    "_id": "60d5ec4b8f1b2c3d4e5f6bbb",
    "title": "Untitled Document",
    "content": "",
    "owner": "user_12345abcdef",
    "collaborators": [],
    "shareToken": "a1b2c3d4...",
    "linkAccess": "none",
    "createdAt": "2026-07-20T13:40:00.000Z",
    "updatedAt": "2026-07-20T13:40:00.000Z"
  }
  ```

---

### 4. Fetch Document Details
Retrieve configuration details and metadata for a specific document by its ID.

* **URL**: `/documents/:id`
* **Method**: `GET`
* **Auth Required**: Optional (If the document is public/shared via a valid token)
* **URL Query Parameters**:
  * `access` (string, optional): The shareToken value for anonymous/link access validation.
* **Response**: `200 OK`
  ```json
  {
    "_id": "60d5ec4b8f1b2c3d4e5f6g7h",
    "title": "Project Design Document",
    "content": "",
    "owner": "user_12345abcdef",
    "collaborators": [],
    "shareToken": "e7b8c9d0...",
    "linkAccess": "none"
  }
  ```
* **Error Responses**:
  * `403 Forbidden` if user is unauthenticated and does not supply a valid `shareToken` matching a non-restricted document state.
  * `404 Not Found` if document ID does not exist in the database database.

---

### 5. Update Document Content
Update document attributes (title or basic content).

* **URL**: `/documents/:id`
* **Method**: `PUT`
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "title": "New Document Title",
    "content": "Raw document content string (optional)"
  }
  ```
* **Response**: `200 OK`

---

### 6. Delete Document
Delete a document from the system. Can only be executed by the document owner.

* **URL**: `/documents/:id`
* **Method**: `DELETE`
* **Auth Required**: Yes
* **Response**: `200 OK`
  ```json
  { "message": "Deleted" }
  ```

---

### 7. Manage Share Settings
Add/update collaborator records or change default link access privileges.

* **URL**: `/documents/:id/share`
* **Method**: `POST`
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "email": "partner@example.com",
    "role": "editor",
    "linkAccess": "viewer"
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "message": "Settings updated",
    "doc": { ... }
  }
  ```

---

### 8. Remove Collaborator
Revoke user access by removing them from the collaborator array list.

* **URL**: `/documents/:id/collaborators/:identifier`
* **Method**: `DELETE`
* **Auth Required**: Yes
* **Response**: `200 OK`
  ```json
  {
    "message": "Collaborator removed",
    "doc": { ... }
  }
  ```

---

## 🔌 WebSocket Services

DocEditor hosts a dedicated Yjs WebSockets signaling server.

* **URL**: `ws://localhost:1234/:documentId`
* **Port**: `1234`
* **Protocol**: `y-websocket` subprotocol

### Connection Initialization
When a client connects using `WebsocketProvider` (passing the document ID as the path), the server initializes state tracking.
- **Join Event**: The server loads the binary buffer representation (`ydoc` property) from MongoDB and sends sync updates to the client.
- **Sync Phase**: Updates are exchanged bi-directionally using standard Yjs updates (`y-websocket` binary frames).
- **Awareness Broadcast**: Awareness updates (presence carets, names, statuses) are synchronized peer-to-peer.
