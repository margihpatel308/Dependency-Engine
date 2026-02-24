# InsightBoard — Dependency Engine (Level 1)

This repository contains the Level 1 backend for the InsightBoard take-home assignment: a service that converts meeting transcripts into a validated dependency graph (tasks with dependencies), detects cycles, sanitizes invalid dependencies, and persists results.

**Level completed:** 1 (Robust Backend)

Tech stack
- Node.js + TypeScript
- Express
- Gemini (via @google/generative-ai) or OpenAI (optional)
- AJV for schema validation
- Simple file-based JSON persistence (data/tasks.db)

Key features
- Strict output schema enforced via AJV
- Sanitizes dependencies (removes any dependency IDs not present in the generated task list)
- Cycle detection: tasks in cycles are flagged with `status: "blocked/error"` (no crash)
- Persists original transcript and tasks to `data/tasks.db`

Cycle detection algorithm (brief)
- Build directed graph from `task.id` → `dependencies`.
- Depth-first search (DFS) with visiting/visited sets; if a node is encountered while in the current recursion stack, nodes on the stack form a cycle.
- All nodes in cycles are collected and flagged as `blocked/error`.

How to run locally
1. Copy `.env.example` to `.env` and fill in keys.
2. Install dependencies:
```bash
npm install
```
3. Build and run server:
```bash
npm run build
npm start
```
4. POST a transcript to the running server:
- Endpoint: `POST /generate` with JSON `{ "prompt": "<TRANSCRIPT_TEXT>" }`
- Example (PowerShell):
```powershell
$txt = Get-Content "Input Transcript.txt" -Raw
$json = @{ prompt = $txt } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri http://localhost:3000/generate -Method Post -Body $json -ContentType 'application/json'
```

Persistence
- The repo uses a simple JSON file at `data/tasks.db`. This is intentionally minimal for the assignment, but can be swapped for PostgreSQL/SQLite/MongoDB.

Notes
- Idempotency / job queue (Level 2) is not implemented in this submission.
- For LLM integration, set `LLM_MODE=gemini` and `GEMINI_API_KEY` (or `LLM_MODE=openai` and `OPENAI_API_KEY`). See `.env.example`.

Repository contents to push
- `src/` — backend code (index.ts, llm.ts, validation.ts, db.ts, process.ts, cli.ts)
- `package.json`, `tsconfig.json`
- `.env.example`, `.gitignore`, `README.md`

If you want, I can initialize a Git repo and push this to your GitHub (you must provide a remote or give me repo details).
# Task Graph Backend (TypeScript + Express)

This backend calls an LLM to produce and validate a list of tasks, detects circular dependencies, sanitizes invalid references, and persists transcripts and task graphs to a database.

**Status:** Production-ready for Railway deployment ✅

Quick Start (Local)

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` (optional).
2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

4. POST to `/generate` with JSON body:

```json
{ "prompt": "Generate tasks for building a feature..." }
```

The response contains sanitized tasks, cycle detection info, and a `transcriptId` stored in the local JSON database.

---

**👉 Ready to deploy? See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for step-by-step Railway deployment guide (recommended for production).**

---

Hosting without an external LLM API
----------------------------------

You can host the backend without using an external hosted LLM (e.g., OpenAI) by using one of the following approaches:

- Mock mode (easy, for demos/testing): set `LLM_MODE=mock` and the server will return deterministic sample tasks. No external API keys needed.
- Local LLM server (self-hosted): run a local LLM server (e.g., text-generation-webui, text-generation-inference, Ollama) and set `LLM_MODE=local` and `LOCAL_LLM_URL` to the server's HTTP endpoint. The backend will forward prompts to your local model.

Environment examples in `./.env`:

```
LLM_MODE=mock
PORT=3000
DATABASE_PATH=./data/tasks.db
```

Or for local LLM:

```
LLM_MODE=local
LOCAL_LLM_URL=http://localhost:5000/api/generate
LOCAL_LLM_METHOD=POST
```

Notes on local LLM servers
- Ollama: simple local server, exposes an HTTP API you can call from the backend.
- text-generation-webui / text-generation-inference: popular options; you may need to deploy a model to the server first.

Hosting the backend publicly without an external API
---------------------------------------------------

If you need the backend accessible on a public URL but do not want to rely on a hosted LLM provider, you can:

- Deploy the backend to a hosting provider (Render, Railway, Vercel). Use `LLM_MODE=mock` in production if you don't plan to expose an LLM.
- Or self-host the backend together with a local LLM server on a VM (e.g., a small cloud VM with GPU) and point `LOCAL_LLM_URL` to the local server. Be mindful of costs and security.
- For testing, expose a local server with `ngrok` (not recommended for production).

If you want, I can:
- Patch the repo to default to `LLM_MODE=mock` and add a `docker-compose.yml` that runs the backend plus an optional local LLM container (if you choose a supported local model), or
- Add exact `LOCAL_LLM` integration instructions for Ollama or TGI based on which local LLM you prefer.

Docker / Compose (quick public hosting option)
---------------------------------------------

To run locally in a container (uses mock LLM by default):

```bash
docker compose up --build
```

This maps port `3000` to the host. The SQLite DB is persisted in `./data`.

If you want the container to call a local LLM service, set `LLM_MODE=local` and update `LOCAL_LLM_URL` in `.env` or via the compose `environment` section. The `docker-compose.yml` includes a commented `local-llm` placeholder you can adapt for your chosen local model.

Deployment to Free Hosting Platforms
====================================

Choose one of the below (all have free tiers):

### Railway.app (Recommended - Easiest)

1. Go to https://railway.app and sign up with GitHub/Google
2. Create a new project → select "Deploy from GitHub"
3. Connect your GitHub repo (or paste the repo URL)
4. Railway auto-detects Node.js and deploys
5. Set environment variables:
   - Go to Project → Variables
   - Add `LLM_MODE=mock` (or `openai` + `OPENAI_API_KEY`)
   - Add `PORT=3000`
6. Deploy! Get public URL in Deployments tab

Cost: Free tier includes $5/month credits (enough for testing).

### Render.com

1. Go to https://render.com, sign up (GitHub or email)
2. New → Web Service → Connect GitHub/GitLab
3. Select your repo
4. Settings:
   - Name: `task-graph-backend`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables (same as Railway)
6. Create service

Free tier: auto-sleeps after 15 min (wakes on request).

### Vercel

1. Go to https://vercel.com, sign up (GitHub/Google)
2. New Project → Import Git Repo
3. Select your repo
4. Environment variables: set `LLM_MODE`, `OPENAI_API_KEY` if needed
5. Deploy

**Note:** Vercel's free tier is optimized for serverless, not long-running servers. Railway or Render recommended.

### Fly.io

1. Install `flyctl`: https://fly.io/docs/hands-on/install-flyctl/
2. `fly auth login`
3. `fly launch` in your project directory
4. Select region, customize `fly.toml`
5. `fly deploy`

Free tier: $5/month credits.

Switching to OpenAI Instead of Mock LLM
========================================

1. Get an OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy (save it somewhere secure!)

2. Update `.env`:

```
LLM_MODE=openai
OPENAI_API_KEY=sk-...(your key)
PORT=3000
```

3. Test locally:

```bash
npm run build && npm start
```

4. Cost: ~$0.001 per request (gpt-4o-mini is cheap)

API Endpoints
=============

- `POST /generate` — Generate tasks from prompt (returns transcriptId, tasks, cycle info, sanitized dependencies)
- `GET /health` — Health check
- `GET /transcripts` — List all transcripts with their prompts
- `GET /tasks/:transcriptId` — Get tasks for a specific transcript

Example:

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"build a todo app"}'

curl http://localhost:3000/transcripts

curl http://localhost:3000/tasks/1
```




