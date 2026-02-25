import { FC } from 'react';
import { useTaskStore } from '../store/taskStore';
import { RotateCcw } from 'lucide-react';

export const Header: FC = () => {
  const transcriptId = useTaskStore((s) => s.transcriptId);
  const reset = useTaskStore((s) => s.reset);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              InsightBoard
            </h1>
            <p className="text-gray-600 mt-1">Dependency Engine</p>
          </div>

          {transcriptId !== null && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              New Transcript
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
