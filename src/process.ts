import { callLLM } from './llm';
import { validateTasks, sanitizeDependencies, detectCycles, Task } from './validation';
import { saveTranscript, saveTasks } from './db';

export async function processPrompt(prompt: string) {
  if (!prompt) throw new Error('prompt required');

  const transcriptId = await saveTranscript(prompt);

  const raw = await callLLM(prompt);

  // Try parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const match = String(raw).match(/\[\s*\{[\s\S]*\}\s*\]/m);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error('LLM did not return valid JSON');
  }

  const { ok, errors } = validateTasks(parsed);
  if (!ok) {
    return { transcriptId, error: 'Validation failed', errors, raw };
  }

  const tasks: Task[] = parsed;

  sanitizeDependencies(tasks);

  const cycleNodes = detectCycles(tasks);
  const hasCycles = cycleNodes.length > 0;
  if (hasCycles) {
    for (const t of tasks) {
      if (cycleNodes.includes(t.id)) t.status = 'blocked/error';
      else t.status = t.status || 'ok';
    }
  }

  await saveTasks(transcriptId, tasks as any[]);

  return { transcriptId, tasks, hasCycles, cycleNodes };
}

export default processPrompt;
