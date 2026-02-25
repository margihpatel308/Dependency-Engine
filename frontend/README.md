# InsightBoard - Dependency Engine Frontend

A modern React + TypeScript frontend for the Dependency Engine assignment. Converts meeting transcripts into interactive task graphs with dependency tracking and cycle detection.

## 🎯 Features

### Level 1 Support
- ✅ Upload/paste meeting transcripts
- ✅ Display generated tasks with dependencies
- ✅ Real-time dependency validation
- ✅ Cycle detection visualization (flags blocked tasks)
- ✅ Task priority display

### Bonus Features (Level 2 & 3)
- ✅ Interactive task completion tracking
- ✅ Dynamic UI state management (unlock tasks as dependencies complete)
- ✅ Dependency graph visualization (SVG-based)
- ✅ Task summary dashboard
- ✅ Error handling and loading states
- ✅ Responsive design for mobile/tablet

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Axios
- **Icons:** Lucide React

## 📋 Project Structure

```
src/
├── components/
│   ├── DependencyGraph.tsx    # SVG-based graph visualization
│   ├── ErrorAlert.tsx          # Error notification
│   ├── Header.tsx              # App header with reset
│   ├── LoadingSpinner.tsx       # Loading indicator
│   ├── TaskList.tsx            # Task grid display
│   ├── TaskSummary.tsx         # Stats dashboard
│   └── TranscriptUpload.tsx    # File/text upload form
├── services/
│   └── api.ts                  # Backend API calls
├── store/
│   └── taskStore.ts            # Zustand state management
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── index.css                   # Tailwind styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running (see backend README)

### Local Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env if backend is not on localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔌 API Integration

The frontend connects to the backend at `VITE_API_URL` (default: `http://localhost:3000`).

### Endpoints Used

```
POST /generate
- Request: { prompt: string } or multipart/form-data with file
- Response: { transcriptId, tasks[], hasCycles, cycleNodes[] }

GET /transcripts
- Response: { transcripts[], count }

GET /tasks/:transcriptId
- Response: { transcriptId, tasks[], count }
```

## 🎨 Key Components

### TaskNode
Displays individual task with:
- Task ID and description
- Priority badge (high/medium/low)
- Dependency list
- Click-to-complete toggle
- Status indicator (blocked/ready/completed)

### DependencyGraph
SVG-based visualization showing:
- Circular layout with task nodes
- Directional edges representing dependencies
- Color coding: Blue (ready) → Green (completed) → Red (blocked/cycle)
- Hover effects and click interactions

### TaskStore (Zustand)
Global state for:
- Task list and completion status
- Cycle detection flags
- Error and loading states
- Helper functions for task status calculation

## 🔄 User Flow

1. **Upload Screen**
   - User pastes/uploads transcript
   - Frontend sends to backend
   
2. **Processing**
   - Loading spinner shows
   - Backend processes with LLM
   
3. **Results Screen**
   - Task summary stats displayed
   - Can toggle between List and Graph views
   - Click task circle to mark complete
   - Blocked tasks become ready as dependencies unlock

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect repo to Vercel
# https://vercel.com/new

# Configure environment variable
VITE_API_URL=https://your-backend-url.com
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
# Add environment variable in Netlify UI
```

### Docker
```bash
docker build -f Dockerfile.frontend -t dependency-engine-frontend .
docker run -p 3000:3000 -e VITE_API_URL=http://backend:3000 dependency-engine-frontend
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend has `cors` enabled (configured in backend)
- Check `VITE_API_URL` matches backend address

### API Connection Failed
- Verify backend is running on correct port
- Check `.env` file has correct `VITE_API_URL`

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`

## 📊 Features by Level

| Feature | Level 1 | Level 2 | Level 3 |
|---------|---------|---------|---------|
| Upload transcripts | ✅ | ✅ | ✅ |
| Display tasks | ✅ | ✅ | ✅ |
| Validate dependencies | ✅ | ✅ | ✅ |
| Cycle detection | ✅ | ✅ | ✅ |
| Task completion tracking | ❌ | ✅ | ✅ |
| Graph visualization | ❌ | ❌ | ✅ |
| Interactive state updates | ❌ | ✅ | ✅ |

## 🧪 Testing

Manual testing checklist:
- [ ] Upload transcript via text input
- [ ] Upload transcript via file
- [ ] Verify tasks display correctly
- [ ] Check cycle detection highlights
- [ ] Click task to mark complete
- [ ] Verify dependent tasks unlock
- [ ] Test graph visualization
- [ ] Test on mobile (responsive)

## 📄 License

This project is part of the Autonomix Innovative Solutions take-home assignment.

## 🤝 Support

For issues with the frontend, check:
1. Backend is running and accessible
2. Environment variables are set correctly
3. API response format matches expected structure
4. Browser console for detailed error messages
