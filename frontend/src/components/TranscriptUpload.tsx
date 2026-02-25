import { FC, ChangeEvent, FormEvent, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import { useTaskStore } from '../store/taskStore';

interface TranscriptUploadProps {
  onSuccess?: () => void;
}

export const TranscriptUpload: FC<TranscriptUploadProps> = ({ onSuccess }) => {
  const [transcriptText, setTranscriptText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const setTasks = useTaskStore((s) => s.setTasks);
  const setError = useTaskStore((s) => s.setError);
  const setLoading = useTaskStore((s) => s.setLoading);
  const setTranscriptId = useTaskStore((s) => s.setTranscriptId);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscriptText(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response;
      if (activeTab === 'text' && transcriptText.trim()) {
        response = await apiService.generateTasks(transcriptText);
      } else if (activeTab === 'file' && file) {
        response = await apiService.generateTasksFromFile(file);
      } else {
        setError('Please provide a transcript or select a file');
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error);
      } else {
        setTranscriptId(response.transcriptId);
        setTasks(response.tasks, response.cycleNodes);
        setTranscriptText('');
        setFile(null);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'text'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'file'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="inline mr-2 h-4 w-4" />
          Upload File
        </button>
      </div>

      {activeTab === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Transcript
          </label>
          <textarea
            value={transcriptText}
            onChange={handleTextChange}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      )}

      {activeTab === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Transcript File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".txt,.doc,.docx,.pdf"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {file.name}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Generate Tasks
      </button>
    </form>
  );
};
