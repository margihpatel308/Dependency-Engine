import { FC } from 'react';
import { useTaskStore } from '../store/taskStore';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export const TaskSummary: FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = useTaskStore((s) => s.completedTasks);
  const cycleNodes = useTaskStore((s) => s.cycleNodes);

  if (tasks.length === 0) return null;

  const totalTasks = tasks.length;
  const completedCount = completedTasks.size;
  const blockedCount = cycleNodes.length;
  const readyCount = tasks.filter(
    (t) =>
      !completedTasks.has(t.id) &&
      !cycleNodes.includes(t.id) &&
      (t.dependencies || []).every((d) => completedTasks.has(d))
  ).length;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Task Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{totalTasks}</div>
          <div className="text-xs text-gray-600">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-500" />
            <div className="text-2xl font-bold text-primary-600">{readyCount}</div>
          </div>
          <div className="text-xs text-gray-600">Ready</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
          </div>
          <div className="text-xs text-gray-600">Blocked</div>
        </div>
      </div>

      {completedCount === totalTasks && (
        <div className="mt-4 text-center text-sm font-semibold text-green-700 bg-green-100 px-3 py-2 rounded">
          🎉 All tasks completed!
        </div>
      )}
    </div>
  );
};
