# InsightBoard — Dependency Engine (Level 1)

A backend service that converts meeting transcripts into a validated dependency graph, detects cycles, sanitizes invalid dependencies, and persists results.

## Tech Stack
- Node.js + TypeScript  
- Express  
- JSON file-based persistence (`data/tasks.db`)  
- Hosted on **Render**  

## Key Features
- Sanitizes dependencies (removes invalid dependency IDs)  
- Cycle detection: tasks in cycles are flagged as `status: "blocked/error"`  
- Persists original transcript and tasks to `data/tasks.db`  

### Cycle Detection Algorithm (Brief)
- Build directed graph from `task.id` → `dependencies`  
- Depth-first search (DFS) with visiting/visited sets; nodes in cycles are flagged `blocked/error`  

## Live Demo
You can access the hosted API here:  
**[Render Link – Dependency Engine](https://dependency-engine-v1.onrender.com)**  

## Test API via Postman

### 1. POST a Transcript as Text
- **Endpoint:** `POST https://YOUR_RENDER_LINK_HERE/generate`  
- **Headers:**  
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "prompt": "Your meeting transcript text here"
  }
  ```
- **Response:** JSON with tasks and dependency graph  

### 2. Upload Transcript File via form-data
- You can also send a transcript file directly using **`multipart/form-data`**.  
- **Steps in Postman:**  
  1. Select **POST** request to `https://YOUR_RENDER_LINK_HERE/generate`.  
  2. Under **Body**, select **form-data**.  
  3. Add a key named `file` of type **File**.  
  4. Choose your transcript file from your system.  
  5. Send the request.  

- **Response:** JSON with tasks and dependency graph generated from the uploaded file.  

> **Tip:** The backend automatically reads the uploaded file, extracts text, and processes it just like raw transcript input.  

## Getting Started Locally
1. Copy `.env.example` to `.env` and fill in keys.  
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build and start the server:
   ```bash
   npm run build
   npm start
   ```
4. POST transcript data as shown above.  

## Persistence
Uses a JSON file at `data/tasks.db`. Can be replaced with PostgreSQL, SQLite, or MongoDB if needed.  
