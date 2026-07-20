# Document Sharing & Permission System Implementation Plan

This plan outlines the architecture for a comprehensive role-based access control (RBAC) sharing system, including direct invites and shareable links.

## User Review Required
> [!IMPORTANT]
> **Share Link Access Level**: When generating a shareable link (`/documents/:id?access=token`), should this link grant `viewer` access or `editor` access by default? For this plan, I am proposing that the owner can configure the global link access level in the Share Modal (e.g., "Anyone with the link can view").

## Proposed Changes

### 1. Database Schema Update
#### [MODIFY] `backend/models/Document.js`
- Migrate from `editors: []` and `viewers: []` to a unified `collaborators` array:
  ```javascript
  collaborators: [{
      identifier: String, // email or username
      role: { type: String, enum: ['editor', 'viewer'] }
  }],
  shareToken: { type: String }, // Randomly generated token for link sharing
  linkAccess: { type: String, enum: ['none', 'viewer', 'editor'], default: 'none' }
  ```

### 2. Backend API Enhancements
#### [MODIFY] `backend/server.js`
- **GET `/documents`**: Update MongoDB `$or` queries to search against the new `collaborators.identifier` array using the authenticated user's emails and username.
- **GET `/documents/:id`**: Update authorization logic to allow access if:
  1. User is owner.
  2. User is in the `collaborators` array.
  3. The request contains a valid `?access=shareToken` query parameter (grants access even to unauthenticated users if desired, or forces login first).
- **POST `/documents/:id/share`**: 
  - Handle adding a new user (email or username) to the `collaborators` array.
  - Handle updating the `linkAccess` level and generating a `shareToken`.
- **PUT/DELETE `/documents/:id/collaborators/:identifier`**: New routes to update roles or revoke access for specific users.

### 3. Frontend UI Updates
#### [MODIFY] `frontend/src/components/ShareModal.jsx`
- **Link Sharing UI**: Add a section to copy the shareable link (`/documents/:id?access=token`) and a dropdown to select link permissions ("Restricted", "Anyone with link can view", "Anyone with link can edit").
- **Collaborator List**: Fetch and display the current list of collaborators.
- **Role Management**: Add a dropdown next to each collaborator to change their role (`editor`, `viewer`) or `Remove` them completely.

#### [MODIFY] `frontend/src/pages/DocumentPage.jsx`
- **URL Parameter Handling**: Extract `?access=token` from the URL and pass it via headers or query params to the backend APIs so the backend validates it.
- **Permission Logic**: Update the `canEdit` hook to calculate permissions based on the new `doc.collaborators` array and the `doc.linkAccess` level.
- Ensure the TipTap editor enforces the `read-only` state reliably if the user resolves to a `viewer` role.

## Verification Plan
1. **Direct Invites**: Invite a test email as a viewer and verify they cannot edit. Change them to editor and verify editing unlocks.
2. **Link Sharing**: Generate a link, open it in an Incognito window (or a different test account), and ensure access is correctly granted based on the token.
3. **Revocation**: Remove a user and verify they lose access immediately on next load.
