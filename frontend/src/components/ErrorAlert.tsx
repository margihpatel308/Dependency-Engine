import { FC, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorAlertProps {
  onDismiss?: () => void;
}

export const ErrorAlert: FC<ErrorAlertProps> = ({ onDismiss }) => {
  const error = useTaskStore((s) => s.error);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-900">Error</h3>
          {isExpanded && (
            <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-red-600 hover:text-red-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
