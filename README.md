# SecondChance

SecondChance is a community marketplace for passing useful household items to a new home. Visitors can browse listings and comments, filter the collection, create an account, and share items with an optional photo.

## Run the full project

Requirements: Docker Desktop with Docker Compose.

1. Copy .env.sample to .env.
2. Replace JWT_SECRET in .env with a random secret of at least 32 characters.
3. Start the services from the project root:

    docker compose up --build

Open the app at http://localhost:3060. The sentiment API runs at http://localhost:3001. MongoDB stores data in a named Docker volume. On first startup, the seed service imports the 16 sample listings once; later starts keep the existing collection.

## Run services during development

Start MongoDB with Docker Compose, then start the backend and sentiment service in separate terminals:

    docker compose up -d mongodb
    npm install --prefix secondChance-backend
    npm start --prefix secondChance-backend
    npm install --prefix sentiment
    npm start --prefix sentiment

To run the React development server, use another terminal:

    npm install --prefix secondChance-frontend
    npm start --prefix secondChance-frontend

The development server proxies /api and /images requests to the backend at port 3060. Use Node.js 20 for local development and CI.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | /api/secondchance/items | List the collection |
| POST | /api/secondchance/items | Add an item with optional multipart image field file |
| GET | /api/secondchance/items/:id | Read one item |
| PUT | /api/secondchance/items/:id | Update item details |
| DELETE | /api/secondchance/items/:id | Delete an item |
| GET | /api/secondchance/search | Filter by name, category, condition, and age_years |
| POST | /api/auth/register | Create an account and issue a JWT |
| POST | /api/auth/login | Verify credentials and issue a JWT |
| GET | /api/auth/me | Read the signed-in profile |
| PUT | /api/auth/update | Update the signed-in member's first name |
| POST | http://localhost:3001/sentiment | Analyze JSON body { "sentence": "..." } |

The sentiment response includes sentimentScore from Natural and a positive, neutral, or negative label. Both services expose /health.

## Hybrid cloud deployment

The Express backend and MongoDB run in Kubernetes. Keep MongoDB on a private
ClusterIP service and set MONGO_URL, MONGO_DB, and a private JWT_SECRET in the
backend pod environment. The frontend is a separate static image for Code Engine.
Build its image with the frontend directory as the Docker context:

    docker build --build-arg REACT_APP_BACKEND_URL=https://your-public-backend-origin -t secondchancewebsite ./secondChance-frontend

Use the real externally reachable backend origin without a trailing slash. This
URL is public configuration, not a secret. Deploy the frontend image on port 9000.

## CI checks

GitHub Actions runs backend API checks, frontend production build, sentiment checks, and Docker builds on pushes and pull requests to main. The user-story issue bodies for the course lab are in docs/user-stories/; the repository issue template is in .github/ISSUE_TEMPLATE/user-story.md.

## Project structure

- secondChance-backend/ — Express REST API, JWT account routes, MongoDB, upload handling.
- secondChance-frontend/ — React single-page app.
- sentiment/ — Natural-based sentiment microservice.
- docs/user-stories/ — eight user stories and acceptance criteria.
- docker-compose.yml — local MongoDB, seed, backend, and sentiment services.
