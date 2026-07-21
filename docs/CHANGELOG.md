# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-20

### Added
- **Monorepo workspaces**: Configured workspaces across root, backend, and frontend packages.
- **Root Dev Scripts**: Added root scripts to start (`npm start`), build (`npm run build`), lint (`npm run lint`), and test (`npm test`) in a single step.
- **CI/CD Pipeline**: Configured GitHub Actions workflows (`.github/workflows/ci.yml`) to validate code quality automatically.
- **ESLint Integration**: Standardized code formatting in the React application using ESLint rules.
- **Developer Utilities**: Moved scripts and batch files to `tools/` folder to clean up root workspaces.
- **MIT License**: Included formal licensing for open-source distribution.
- **Documentation**: Generated complete repository docs including `ARCHITECTURE.md`, `ROADMAP.md`, `API.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_QUALITY.md`.
- **Throttled Utilities**: Modularized the throttled save callback into a reusable function in `backend/utils/throttle.js`.
- **Unit Testing**: Implemented unit tests for the throttle callback inside `backend/test_throttle.js`.

### Removed
- Deleted unused UI asset `frontend/src/assets/auth-illustration.png`.
- Deleted temporary `frontend/build_error.txt` log file.
- Cleaned up untracked/test scripts from root.
