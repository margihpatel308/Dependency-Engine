import { FC, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Loader, ChevronDown, ChevronUp } from 'lucide-react';

interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptId?: number;
  error?: string;
  createdAt: string;
}

/**
 * Level 2 Async Processing Component
 * Demonstrates handling slow LLM requests with jobId polling
 */
export const AsyncProcessingDemo: FC = () => {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const simulateAsyncJob = () => {
    const newJob: JobStatus = {
      jobId: `job-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((job) =>
          job.jobId === newJob.jobId ? { ...job, status: 'processing' } : job
        )
      );
    }, 1000);

    // Simulate completion
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((job) =>
          job.jobId === newJob.jobId
            ? { ...job, status: 'completed', transcriptId: 1 }
            : job
        )
      );
    }, 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Async Processing (Level 2 Demo)
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-600 hover:text-gray-900"
        >
          {showDetails ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {showDetails && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <p className="font-semibold mb-2">How Async Processing Works:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Frontend submits transcript, receives jobId</li>
            <li>Frontend polls /jobs/:jobId for status updates</li>
            <li>Backend processes transcript with LLM (10+ seconds)</li>
            <li>Frontend updates UI when job completes</li>
            <li>Prevents UI freezing during long operations</li>
          </ol>
        </div>
      )}

      <button
        onClick={simulateAsyncJob}
        className="w-full mb-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Simulate Async Job (10s processing)
      </button>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No jobs yet</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.jobId}
              className={`p-3 border rounded flex items-center gap-3 ${
                job.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : job.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              {job.status === 'processing' && (
                <Loader className="h-4 w-4 text-yellow-600 animate-spin" />
              )}
              {job.status === 'completed' && (
                <span className="text-green-600 text-lg">✓</span>
              )}
              {job.status === 'pending' && (
                <span className="text-yellow-600 text-lg">◌</span>
              )}

              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{job.jobId}</div>
                <div className="text-xs text-gray-600">
                  {job.status === 'processing'
                    ? 'Processing...'
                    : job.status === 'completed'
                      ? 'Completed'
                      : 'Queued'}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                {new Date(job.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {jobs.length > 0 && (
        <div className="mt-4 text-xs text-gray-600 p-3 bg-gray-50 rounded">
          <strong>In Production:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Frontend polls /jobs/:jobId every 2 seconds</li>
            <li>Stores jobId in localStorage for page refresh</li>
            <li>Prevents duplicate processing for same transcript</li>
            <li>Timeout after 5 minutes with graceful error</li>
          </ul>
        </div>
      )}
    </div>
  );
};
