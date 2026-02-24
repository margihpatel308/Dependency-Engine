import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/tasks.db';

interface TranscriptRecord {
  id: number;
  prompt: string;
  created_at: string;
}

interface TaskRecord {
  id: number;
  task_id: string;
  description: string;
  priority: string;
  dependencies: string;
  status: string;
  transcript_id: number;
  created_at: string;
}

interface DbState {
  transcripts: TranscriptRecord[];
  tasks: TaskRecord[];
  nextTranscriptId: number;
  nextTaskId: number;
}

let state: DbState | null = null;

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDb(): DbState {
  ensureDir(DB_PATH);
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      // corrupt or invalid, start fresh
    }
  }
  return { transcripts: [], tasks: [], nextTranscriptId: 1, nextTaskId: 1 };
}

function saveDb() {
  if (!state) return;
  ensureDir(DB_PATH);
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

function getDb(): DbState {
  if (!state) state = loadDb();
  return state;
}

export async function saveTranscript(prompt: string) {
  const db = getDb();
  const id = db.nextTranscriptId++;
  db.transcripts.push({
    id,
    prompt,
    created_at: new Date().toISOString()
  });
  saveDb();
  return id;
}

export async function saveTasks(transcriptId: number, tasks: any[]) {
  const db = getDb();
  for (const t of tasks) {
    db.tasks.push({
      id: db.nextTaskId++,
      task_id: t.id,
      description: t.description,
      priority: t.priority,
      dependencies: JSON.stringify(t.dependencies || []),
      status: t.status || 'ok',
      transcript_id: transcriptId,
      created_at: new Date().toISOString()
    });
  }
  saveDb();
}

export async function initDb() {
  getDb();
}

export function getTranscripts() {
  const db = getDb();
  return db.transcripts.map(t => ({ id: t.id, prompt: t.prompt, created_at: t.created_at }));
}

export function getTasksByTranscriptId(transcriptId: number) {
  const db = getDb();
  return db.tasks
    .filter(t => t.transcript_id === transcriptId)
    .map(t => ({
      id: t.id,
      task_id: t.task_id,
      description: t.description,
      priority: t.priority,
      dependencies: JSON.parse(t.dependencies),
      status: t.status
    }));
}

export default null;
