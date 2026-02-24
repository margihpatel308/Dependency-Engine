import Ajv, { JSONSchemaType } from 'ajv';

export type Task = {
  id: string;
  description: string;
  priority: string;
  dependencies: string[];
  status?: string;
};

const ajv = new Ajv({ allErrors: true });

const schema: JSONSchemaType<Task[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      description: { type: 'string' },
      priority: { type: 'string' },
      dependencies: { type: 'array', items: { type: 'string' } },
      status: { type: 'string', nullable: true }
    },
    required: ['id', 'description', 'priority', 'dependencies'],
    additionalProperties: false
  }
};

const validate = ajv.compile(schema);

export function validateTasks(input: unknown) {
  const ok = validate(input as any);
  return { ok: !!ok, errors: validate.errors };
}

export function sanitizeDependencies(tasks: Task[]) {
  const ids = new Set(tasks.map((t) => t.id));
  for (const t of tasks) {
    t.dependencies = (t.dependencies || []).filter((d) => ids.has(d));
  }
}

export function detectCycles(tasks: Task[]) {
  const graph = new Map<string, string[]>();
  for (const t of tasks) graph.set(t.id, t.dependencies || []);

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const inCycle = new Set<string>();

  function dfs(node: string, stack: string[]) {
    if (visiting.has(node)) {
      // found cycle
      const idx = stack.indexOf(node);
      for (let i = idx; i < stack.length; i++) inCycle.add(stack[i]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    const neigh = graph.get(node) || [];
    for (const n of neigh) dfs(n, stack);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const id of graph.keys()) dfs(id, []);

  return Array.from(inCycle);
}
