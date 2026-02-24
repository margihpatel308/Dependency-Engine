#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import processPrompt from './process';

// Load environment vars from project root .env so CLI can use LLM keys
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const arg = process.argv[2] || path.resolve(process.cwd(), 'Input Transcript.txt');
  if (!fs.existsSync(arg)) {
    console.error('Transcript file not found:', arg);
    process.exit(2);
  }
  const outPath = process.argv[3] || process.env.OUT_PATH || null;
  const txt = fs.readFileSync(arg, 'utf-8');
  try {
    const res = await processPrompt(txt);
    const out = JSON.stringify(res, null, 2);
    if (outPath) {
      fs.writeFileSync(outPath, out, 'utf-8');
      console.error('Wrote output to', outPath);
    } else {
      // print to stdout only if no outPath specified
      console.log(out);
    }
    process.exit(0);
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (outPath) {
      fs.writeFileSync(outPath, JSON.stringify({ error: msg }, null, 2), 'utf-8');
      console.error('Processing failed; wrote error to', outPath);
      process.exit(1);
    }
    console.error('Processing failed:', msg);
    process.exit(1);
  }
}

main();
