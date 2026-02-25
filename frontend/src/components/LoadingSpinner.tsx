import { FC } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Loader } from 'lucide-react';

export const LoadingSpinner: FC = () => {
  const isLoading = useTaskStore((s) => s.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
        <p className="text-lg font-semibold text-gray-900">Processing transcript...</p>
        <p className="text-sm text-gray-600">This may take a few seconds</p>
      </div>
    </div>
  );
};
