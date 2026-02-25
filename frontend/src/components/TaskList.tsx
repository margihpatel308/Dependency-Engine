import { FC, memo } from 'react';
import { Task } from '../services/api';
import { useTaskStore } from '../store/taskStore';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

interface TaskNodeProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const TaskNode: FC<TaskNodeProps> = memo(({ task, onComplete }) => {
  const { getTaskStatus, completedTasks } = useTaskStore();
  const status = getTaskStatus(task.id);
  const isCompleted = completedTasks.has(task.id);

  const statusStyles = {
    completed: 'bg-green-50 border-green-200',
    ready: 'bg-blue-50 border-primary-200',
    blocked: 'bg-red-50 border-red-200',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const getPriorityColor = (priority: string) => {
    const key = priority.toLowerCase();
    return priorityColors[key as keyof typeof priorityColors] || priorityColors.default;
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${statusStyles[status]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 flex-1">{task.id}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{task.description}</p>

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="text-xs text-gray-600 mb-3">
              <strong>Depends on:</strong> {task.dependencies.join(', ')}
            </div>
          )}

          {task.status && (
            <div className="text-xs font-medium text-gray-600 mb-3">
              Status: <span className="text-gray-900">{task.status}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {status === 'blocked' ? (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          ) : isCompleted ? (
            <CheckCircle
              className="h-6 w-6 text-green-500 cursor-pointer hover:text-green-600"
              onClick={() => onComplete(task.id)}
            />
          ) : (
            <Circle
              className="h-6 w-6 text-primary-400 cursor-pointer hover:text-primary-500"
              onClick={() => onComplete(task.id)}
            />
          )}
        </div>
      </div>

      {status === 'blocked' && !task.status?.includes('blocked/error') && (
        <div className="mt-3 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
          ⚠️ Dependencies not met. Complete dependencies to unlock.
        </div>
      )}

      {task.status?.includes('blocked/error') && (
        <div className="mt-3 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
          ⚠️ Cycle detected - this task is part of a dependency cycle.
        </div>
      )}
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: FC<TaskListProps> = ({ tasks }) => {
  const { completeTask, completedTasks } = useTaskStore();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks generated yet.</p>
      </div>
    );
  }

  // Sort tasks: completed first, then ready, then blocked
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusA = completedTasks.has(a.id) ? 0 : a.dependencies?.some(d => !completedTasks.has(d)) ? 2 : 1;
    const statusB = completedTasks.has(b.id) ? 0 : b.dependencies?.some(d => !completedTasks.has(d)) ? 2 : 1;
    return statusA - statusB;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTasks.map((task) => (
        <TaskNode
          key={task.id}
          task={task}
          onComplete={completeTask}
        />
      ))}
    </div>
  );
};
