import { create } from 'zustand';
import { Task } from '../services/api';

interface TaskStore {
  tasks: Task[];
  completedTasks: Set<string>;
  cycleNodes: string[];
  error: string | null;
  isLoading: boolean;
  transcriptId: number | null;

  setTasks: (tasks: Task[], cycleNodes?: string[]) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setTranscriptId: (id: number) => void;
  reset: () => void;
  getTaskStatus: (taskId: string) => 'completed' | 'ready' | 'blocked';
  getCompletedDependencies: (taskId: string) => string[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  completedTasks: new Set(),
  cycleNodes: [],
  error: null,
  isLoading: false,
  transcriptId: null,

  setTasks: (tasks: Task[], cycleNodes?: string[]) => {
    set({
      tasks,
      cycleNodes: cycleNodes || [],
      completedTasks: new Set(),
    });
  },

  completeTask: (taskId: string) => {
    set((state) => ({
      completedTasks: new Set([...state.completedTasks, taskId]),
    }));
  },

  uncompleteTask: (taskId: string) => {
    set((state) => {
      const newCompleted = new Set(state.completedTasks);
      newCompleted.delete(taskId);
      return { completedTasks: newCompleted };
    });
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setTranscriptId: (id: number) => set({ transcriptId: id }),

  reset: () => {
    set({
      tasks: [],
      completedTasks: new Set(),
      cycleNodes: [],
      error: null,
      isLoading: false,
      transcriptId: null,
    });
  },

  getTaskStatus: (taskId: string) => {
    const state = get();
    if (state.cycleNodes.includes(taskId)) return 'blocked';
    if (state.completedTasks.has(taskId)) return 'completed';

    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return 'blocked';

    const allDependenciesMet = (task.dependencies || []).every((depId) =>
      state.completedTasks.has(depId)
    );

    return allDependenciesMet ? 'ready' : 'blocked';
  },

  getCompletedDependencies: (taskId: string) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return [];
    return (task.dependencies || []).filter((depId) =>
      state.completedTasks.has(depId)
    );
  },
}));
