# Mini Workflow Engine

The **GenAI Stack** is a No-Code/Low-Code web application that enables users to visually create and interact with intelligent workflows. It allows users to drag-and-drop components to configure complex flows that handle user input, extract knowledge from documents (RAG), interact with LLMs (OpenAI, Gemini), and return answers through a chat interface.

Once a user builds a valid workflow, they can interact with it in real-time. The system processes queries using the defined nodes—combining prompt templates, vector search, and AI generation—to deliver intelligent responses.

## Tech Stack
- **Frontend**: React, Vite, React Flow, TailwindCSS
- **Backend**: FastAPI, PostgreSQL, Pydantic
- **AI**: OpenAI, Gemini
- **Vector DB**: ChromaDB (for RAG)

## Features
- **Visual Editor**: Drag inputs, prompts, and LLM nodes.
- **Connections**: Link nodes to define data flow.
- **Execution**: Run workflows and see results in real-time.
- **Knowledge Base (RAG)**: 
    - Upload PDF documents.
    - Query documents using the **RagNode**.
- **Custom Nodes**: 
    - `Input`: Define variables like `{topic}`.
    - `Prompt`: Template strings like "Tell me a joke about {input}".
    - `LLM`: Choose between GPT-3.5, Gemini.
    - `RAG`: Search uploaded PDFs.
    - `Output`: View the final response.

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- **Optional**: PostgreSQL Database
- API Keys: `OPENAI_API_KEY` and/or `GOOGLE_API_KEY`

## Quick Start (Windows)
If you are on Windows, you can use the provided batch script to quickly start the backend.

1. **Backend**:
   ```cmd
   cd backend
   run.bat
   ```
   *This script sets up the virtual environment, installs dependencies, and starts the server.*

2. **Frontend** (in a new terminal):
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

## Manual Setup

### Backend
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   # Activate:
   # Windows: .\venv\Scripts\Activate
   # Mac/Linux: source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. Create a `.env` file in `backend/` with your keys.
   *Note: `DATABASE_URL` is optional.*
   ```env
   OPENAI_API_KEY=sk-...
   GOOGLE_API_KEY=AIza...
   # Optional:
   # DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

4. Run the server:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   # Runs on http://localhost:8000
   ```
   *Note: This will automatically create the necessary database tables.*

### Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

## Usage
1. **RAG / Knowledge Base**:
   - Use the UI (or API) to upload a PDF.
   - Add a `RagNode` to your flow.
   - Enter the filename (e.g., `resume.pdf`) and your query.
2. **Standard Flow**:
   - Drag an **Input** node. Set Label to `topic`.
   - Drag a **Prompt Template**. Connect Input -> Prompt. Set template to `Explain {topic} in 5 words`.
   - Drag an **LLM** node. Connect Prompt -> LLM. Select Model.
   - Drag an **Output** node. Connect LLM -> Output.
   - Click **Run Workflow**.
