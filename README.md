## CypherStudio

A lightweight full‑stack playground for creating, editing, and persisting code projects. The client is a React + Vite app, and the server is an Express + Mongoose API that stores project files in MongoDB.

### Features
- **React client (Vite)** with a simple editor, file explorer, and auth/profile stubs
- **Express API** for creating, updating, and fetching projects
- **MongoDB persistence** via Mongoose (Atlas or local)
- Clear separation of `client/` and `server/`

### Tech Stack
- **Frontend**: React 19, Vite
- **Backend**: Node.js, Express 5
- **Database**: MongoDB with Mongoose 8
- **HTTP**: Axios

### Repository Structure
```
CypherStudio/
  client/            # React + Vite frontend
    src/
      components/    # Editor, FileExplorer, AuthModal, UserProfile
      contexts/      # AuthContext
      services/      # api.js (talks to server)
  server/            # Express + Mongoose backend API
    models/          # Project.js schema
    server.js        # API routes and bootstrap
  README.md
```

### Prerequisites
- Node.js 18+ and npm
- A MongoDB instance (Atlas or local)

### Environment Variables
Create a `.env` file in `server/` with:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
# Optional; defaults to 5000
PORT=5000
```

### Install
Run installs separately in `client/` and `server/`:
```bash
cd client && npm install
cd ../server && npm install
```

### Run Locally
Use two terminals.

1) Start the API server:
```bash
cd server
node server.js
# Server runs on http://localhost:5000
```

2) Start the React client (Vite dev server):
```bash
cd client
npm run dev
# Follow the printed URL (typically http://localhost:5173)
```

The client calls the API at `http://localhost:5000` (see `client/src/services/api.js`). If you change the API origin or port, update it there or introduce an environment-driven configuration.

### API Reference
Base URL: `http://localhost:5000/api`

- POST `/projects`
  - Description: Create or update a project and its files
  - Body (JSON):
    ```json
    {
      "projectId": "project_123",
      "files": { "path/to/file.txt": "content" }
    }
    ```
  - Response: `{ success: true, project }`

- GET `/projects/:projectId`
  - Description: Fetch a project by ID
  - Response: `Project | null`

### Client Scripts
From `client/`:
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built app
- `npm run lint` – run ESLint

### Server Scripts
From `server/`:
- Start server: `node server.js`

### Data Model
`server/models/Project.js`:
```js
projectId: String (unique, required)
files: Object (key: file path, value: content)
```

### Troubleshooting
- **MongoDB connection fails**: verify `MONGODB_URI` in `server/.env` and network/IP allowlist on Atlas.
- **CORS issues**: server enables `cors()` globally; ensure you are using the correct client origin.
- **Port conflicts**: change `PORT` in `server/.env` or Vite’s port via `--port` when running dev.

### Notes
- The client currently points to a fixed API URL in `client/src/services/api.js`. For different environments, consider moving this to environment variables.

### License
ISC (see `server/package.json`). Update as needed for your project.


