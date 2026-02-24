import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import processPrompt from './process';
import { initDb } from './db';
import multer from "multer";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage()
});

app.get('/', (req, res) => res.send({ ok: true, message: 'Task Graph Backend', version: '1.0.0' }));

app.get('/health', (req, res) => res.send({ status: 'ok', timestamp: new Date().toISOString() }));


app.post("/generate", upload.single("file"), async (req, res) => {
  try {
    let transcriptText = "";

    // If file uploaded
    if (req.file) {
      transcriptText = req.file.buffer.toString("utf-8");
    }
    // If JSON sent
    else if (req.body.prompt) {
      transcriptText = req.body.prompt;
    }
    else {
      return res.status(400).json({ error: "Transcript is required" });
    }
    const result = await processPrompt(transcriptText);
    if ((result as any).error) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error(`[${new Date().toISOString()}] /generate ERROR: ${msg}`);
    if (err?.stack) console.error(err.stack);
    return res.status(500).json({ error: msg });
  }
});

// GET /transcripts - list all transcripts with metadata
app.get('/transcripts', (req, res) => {
  try {
    const { getTranscripts } = require('./db');
    const transcripts = getTranscripts?.() || [];
    return res.json({ transcripts, count: transcripts.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /tasks/:transcriptId - get tasks for a specific transcript
app.get('/tasks/:transcriptId', (req, res) => {
  try {
    const transcriptId = Number(req.params.transcriptId);
    const { getTasksByTranscriptId } = require('./db');
    const tasks = getTasksByTranscriptId?.(transcriptId) || [];
    return res.json({ transcriptId, tasks, count: tasks.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const port = Number(process.env.PORT || 3000);

async function start() {
  await initDb();
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
