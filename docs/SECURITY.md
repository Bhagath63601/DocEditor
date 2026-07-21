# Security Policy - DocEditor

## Supported Versions

Only the latest stable version of DocEditor receives security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of DocEditor seriously. If you find a security vulnerability, please do not open a public issue. Instead, report it responsibly:

1. Email the core maintenance team at **security@example.com** with details.
2. Include a detailed description of the vulnerability, steps to reproduce, and a proof of concept if available.
3. Allow up to 48 hours for an acknowledgment response.
4. We will coordinate a patch release and public disclosures within 30 days of validation.

## Security Practices in DocEditor

- **Token Audits**: Authentication tokens must be validated on every request.
- **Environment Separation**: Sensitive credentials (e.g. JWT secret keys, databases, Clerk keys) are isolated inside `.env` configurations and never committed to source control.
- **Input Validation**: API inputs are sanitized before database writes.
- **CRDT Integrity**: WebSocket connections validate access tokens against document ownership profiles prior to syncing binary updates.
