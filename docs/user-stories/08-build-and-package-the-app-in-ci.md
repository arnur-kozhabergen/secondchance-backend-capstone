# Build and package the app in CI

Label: technical debt

As a maintainer, I need CI to validate the frontend, backend syntax, and sentiment service so that broken changes are caught before deployment.

## Acceptance criteria
- A push or pull request installs locked dependencies and builds the frontend.
- CI runs sentiment service checks and verifies backend JavaScript syntax.
- The backend and sentiment services have container build instructions.