import { FC, useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const InteractiveMermaidGraph: FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = useTaskStore((s) => s.completedTasks);
  const cycleNodes = useTaskStore((s) => s.cycleNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (tasks.length === 0) return null;

  // Generate Mermaid diagram
  const generateMermaidDiagram = () => {
    let diagram = 'graph TD\n';

    tasks.forEach((task) => {
      const status = cycleNodes.includes(task.id)
        ? '❌'
        : completedTasks.has(task.id)
          ? '✅'
          : '⏳';

      const label = `${task.id}<br/>${status}<br/><i>${task.description.slice(0, 20)}...</i>`;

      if (cycleNodes.includes(task.id)) {
        diagram += `    ${task.id}["<b>${label}</b>"]:::error\n`;
      } else if (completedTasks.has(task.id)) {
        diagram += `    ${task.id}["<b>${label}</b>"]:::completed\n`;
      } else {
        diagram += `    ${task.id}["<b>${label}</b>"]:::ready\n`;
      }
    });

    tasks.forEach((task) => {
      task.dependencies?.forEach((dep) => {
        diagram += `    ${dep} --> ${task.id}\n`;
      });
    });

    diagram += `\n    classDef ready fill:#e0f2fe,stroke:#0284c7,stroke-width:2px\n`;
    diagram += `    classDef completed fill:#dcfce7,stroke:#16a34a,stroke-width:2px\n`;
    diagram += `    classDef error fill:#fee2e2,stroke:#dc2626,stroke-width:2px\n`;

    return diagram;
  };

  const diagram = generateMermaidDiagram();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependency Flow (Mermaid)</h3>

      <div className="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto max-h-96">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{diagram}</pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
        <p>
          <strong>Tip:</strong> Use{' '}
          <a
            href="https://mermaid.live"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Mermaid.live
          </a>{' '}
          to visualize this diagram
        </p>
      </div>

      {selectedNode && (
        <div className="mt-4 p-4 border-l-4 border-primary-500 bg-primary-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedNode}</h4>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                {tasks
                  .filter((t) => t.id === selectedNode)
                  .map((task) => (
                    <div key={task.id}>
                      <p>
                        <strong>Description:</strong> {task.description}
                      </p>
                      <p>
                        <strong>Priority:</strong> {task.priority}
                      </p>
                      <p>
                        <strong>Dependencies:</strong>{' '}
                        {task.dependencies?.length ? task.dependencies.join(', ') : 'None'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {cycleNodes.includes(task.id)
                          ? 'Blocked (Cycle)'
                          : completedTasks.has(task.id)
                            ? 'Completed'
                            : 'In Progress'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DependencyMatrix: FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = useTaskStore((s) => s.completedTasks);
  const cycleNodes = useTaskStore((s) => s.cycleNodes);

  if (tasks.length === 0) return null;

  const getCell = (from: Task, to: Task): string => {
    if (from.dependencies?.includes(to.id)) {
      return completedTasks.has(to.id) ? '✅' : '⏳';
    }
    if (to.dependencies?.includes(from.id)) {
      return completedTasks.has(from.id) ? '✅' : '⏳';
    }
    return '-';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependency Matrix</h3>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 p-2 font-semibold">Task</th>
              {tasks.map((task) => (
                <th
                  key={`header-${task.id}`}
                  className="border border-gray-300 bg-gray-100 p-2 font-semibold text-center"
                >
                  {task.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((fromTask) => (
              <tr key={`row-${fromTask.id}`}>
                <td className="border border-gray-300 bg-gray-100 p-2 font-semibold">
                  {fromTask.id}
                </td>
                {tasks.map((toTask) => (
                  <td
                    key={`cell-${fromTask.id}-${toTask.id}`}
                    className="border border-gray-300 p-2 text-center"
                  >
                    {getCell(fromTask, toTask)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>
          <strong>Legend:</strong>
        </p>
        <p>✅ = Dependency met/completed</p>
        <p>⏳ = Dependency pending</p>
        <p>- = No dependency</p>
      </div>
    </div>
  );
};
