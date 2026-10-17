# Register and sign in securely

Label: new

As a neighbor, I need to create an account and sign in so that I can share items with the community.

## Acceptance criteria
- Registration validates names, email format, and password length.
- Passwords are stored as one-way hashes and never returned by the API.
- Login issues a time-limited JWT and rejects invalid credentials.
- Duplicate email addresses receive a clear conflict response.