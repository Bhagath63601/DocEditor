# Document Sharing System Tasks

- `[x]` Update Database Schema
  - Modify `Document.js` to use `collaborators` array, `shareToken`, and `linkAccess`.
- `[x]` Update Backend API Routes
  - Update `GET /documents` to search `collaborators`.
  - Update `GET /documents/:id` to support `access` token parameter.
  - Update `POST /documents/:id/share` for inviting and generating tokens.
  - Add `PUT/DELETE /documents/:id/collaborators/:identifier`.
- `[x]` Update ShareModal UI
  - Show current collaborators with role dropdown and remove button.
  - Show Link sharing options (access level and copy link).
- `[x]` Update DocumentPage
  - Parse `?access=token` and update permissions dynamically.
  - Update `canEdit` hook.
