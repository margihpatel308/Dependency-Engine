## Frontend Development Notes

### Architecture Decisions

1. **Zustand for State Management**
   - Lightweight alternative to Redux
   - Stores task list, completion status, cycles, errors, loading state
   - Provides helper functions to calculate task status based on dependencies

2. **Tailwind CSS for Styling**
   - Utility-first approach for rapid development
   - Responsive design built-in
   - Dark mode ready

3. **SVG Graph Visualization**
   - No external graph library dependency
   - Simple circular layout
   - Direct SVG manipulation for performance
   - Color-coded nodes: Blue (ready), Green (completed), Red (blocked)
   - Directional edges with arrows

4. **Axios for API Calls**
   - Simple, typed API client
   - Automatic JSON serialization
   - Supports multipart form data for file uploads

### Component Breakdown

- **Header**: Navigation and reset functionality
- **TranscriptUpload**: Two-tab interface for text/file input
- **TaskList**: Grid layout showing task cards with click-to-complete
- **TaskNode**: Individual task card with status indicators
- **DependencyGraph**: SVG visualization with interactive nodes
- **TaskSummary**: Stats dashboard (total, completed, ready, blocked)
- **LoadingSpinner**: Full-screen spinner during processing
- **ErrorAlert**: Dismissible error notification

### State Flow

```
User Input
  ↓
TranscriptUpload (text/file)
  ↓
API Call (apiService.generateTasks)
  ↓
setTasks() → Zustand store
  ↓
TaskList/DependencyGraph render with tasks
  ↓
User clicks task → completeTask()
  ↓
Store updates → UI re-renders with new status
```

### Key Features

1. **Dependency Validation**
   - Reads blocked/error status from backend
   - Highlights circular dependencies in red

2. **Interactive Completion**
   - Click any task node to mark complete
   - Automatically updates dependent tasks
   - Visual feedback with color changes

3. **Responsive Design**
   - Mobile-first approach
   - Grid adapts from 1→2→3 columns
   - Touch-friendly click targets

### Performance Optimizations

- `React.memo` on TaskNode to prevent unnecessary re-renders
- Zustand selectors for fine-grained reactivity
- SVG graph doesn't re-render entire DOM on state changes
- Lazy loading of graph visualization (toggle button)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020 target for good balance of compatibility
- No polyfills needed for primary features

### Future Enhancements

- Drag-and-drop file upload
- Export tasks to CSV/JSON
- Keyboard shortcuts for task completion
- Dark mode toggle
- Real-time collaboration (WebSocket)
- More advanced graph layouts (Dagre, D3)
- Task filtering/search
- Dependency path highlighting
