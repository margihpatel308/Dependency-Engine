import { FC, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../services/api';

const generateGraphData = (tasks: Task[], completedTasks: Set<string>, cycleNodes: string[]) => {
  const nodeRadius = 40;
  const padding = 100;
  
  // Simple circular layout
  const positions = new Map<string, { x: number; y: number }>();
  const angleSlice = (Math.PI * 2) / tasks.length;
  const centerX = 600;
  const centerY = 300;
  const radius = 200;

  tasks.forEach((task, index) => {
    const angle = angleSlice * index;
    positions.set(task.id, {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  });

  return { positions, nodeRadius };
};

export const DependencyGraph: FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = useTaskStore((s) => s.completedTasks);
  const cycleNodes = useTaskStore((s) => s.cycleNodes);
  const completeTask = useTaskStore((s) => s.completeTask);
  const getTaskStatus = useTaskStore((s) => s.getTaskStatus);

  const { positions, nodeRadius } = generateGraphData(tasks, completedTasks, cycleNodes);

  if (tasks.length === 0) {
    return null;
  }

  const svgWidth = 1200;
  const svgHeight = 600;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependency Graph</h3>
      
      <svg width={svgWidth} height={svgHeight} className="border border-gray-200 rounded bg-gray-50">
        {/* Draw dependency edges */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#9ca3af" />
          </marker>
          <marker
            id="arrowhead-blocked"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {tasks.map((task) => {
          const fromPos = positions.get(task.id);
          if (!fromPos) return null;

          return (task.dependencies || []).map((depId) => {
            const toPos = positions.get(depId);
            if (!toPos) return null;

            const isBlocked = cycleNodes.includes(task.id) || cycleNodes.includes(depId);

            return (
              <line
                key={`edge-${task.id}-${depId}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isBlocked ? '#ef4444' : '#d1d5db'}
                strokeWidth="2"
                markerEnd={isBlocked ? 'url(#arrowhead-blocked)' : 'url(#arrowhead)'}
                opacity="0.6"
              />
            );
          });
        })}

        {/* Draw task nodes */}
        {tasks.map((task) => {
          const pos = positions.get(task.id);
          if (!pos) return null;

          const status = getTaskStatus(task.id);
          let fillColor = '#0ea5e9'; // primary-500
          if (completedTasks.has(task.id)) fillColor = '#22c55e'; // green
          if (cycleNodes.includes(task.id)) fillColor = '#ef4444'; // red

          return (
            <g key={`node-${task.id}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={fillColor}
                opacity="0.9"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onClick={() => completeTask(task.id)}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                {task.id}
              </text>
              <title>{`${task.id}: ${task.description}`}</title>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
          <span className="text-gray-700">Ready / In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Blocked / Error</span>
        </div>
      </div>
    </div>
  );
};
