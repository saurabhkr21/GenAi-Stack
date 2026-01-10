# GenAI Stack - Frontend

The frontend interface for the GenAI Stack, a visual workflow builder for LLM applications. Built with React, Vite, and React Flow.

## Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4 + Radix UI
- **Workflow**: React Flow
- **Icons**: Lucide React
- **State/Animations**: Framer Motion

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at [http://localhost:5173](http://localhost:5173).

## Key Features
- **Visual Builder**: Drag and drop nodes to create LangChain-style workflows.
- **Components**:
    - **Sidebar**: Draggable components (Input, LLM, Prompt, Output, etc.).
    - **Canvas**: Interactive workspace powered by React Flow.
    - **Properties Panel**: Configure node settings (Prompts, Models, API Keys).

## Scripts
- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
- `npm run preview`: Preview production build.
