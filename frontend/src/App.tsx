import { useState } from 'react';
import { Header } from './components/Header';
import { TranscriptUpload } from './components/TranscriptUpload';
import { TaskList } from './components/TaskList';
import { TaskSummary } from './components/TaskSummary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { DependencyGraph } from './components/DependencyGraph';
import { InteractiveMermaidGraph, DependencyMatrix } from './components/AdvancedVisualization';
import { AsyncProcessingDemo } from './components/AsyncProcessingDemo';
import { useTaskStore } from './store/taskStore';

function App() {
  const tasks = useTaskStore((s) => s.tasks);
  const transcriptId = useTaskStore((s) => s.transcriptId);
  const setError = useTaskStore((s) => s.setError);
  const [showGraph, setShowGraph] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'svg' | 'mermaid' | 'matrix'>('list');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {transcriptId === null ? (
          // Upload view
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Convert Transcripts to Task Graphs
              </h2>
              <p className="text-gray-600 mb-6">
                Upload a meeting transcript and let our AI engine automatically extract tasks,
                detect dependencies, and identify any circular dependencies.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload or Paste</h3>
                    <p className="text-sm text-gray-600">Provide a meeting transcript</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Processing</h3>
                    <p className="text-sm text-gray-600">
                      LLM extracts tasks and dependencies
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Validation & Visualization</h3>
                    <p className="text-sm text-gray-600">
                      View tasks, track progress, detect cycles
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <TranscriptUpload onSuccess={() => setShowGraph(false)} />
            </div>
          </div>
        ) : (
          // Results view
          <div className="space-y-6">
            <TaskSummary />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('svg')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'svg'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                🎯 Graph View
              </button>
              <button
                onClick={() => setViewMode('mermaid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'mermaid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                📊 Mermaid Diagram
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                🔲 Matrix View
              </button>
            </div>

            {viewMode === 'list' && <TaskList tasks={tasks} />}
            {viewMode === 'svg' && <DependencyGraph />}
            {viewMode === 'mermaid' && <InteractiveMermaidGraph />}
            {viewMode === 'matrix' && <DependencyMatrix />}

            <div className="border-t pt-6">
              <AsyncProcessingDemo />
            </div>
          </div>
        )}
      </main>

      <LoadingSpinner />
      <ErrorAlert onDismiss={() => setError(null)} />
    </div>
  );
}

export default App;
