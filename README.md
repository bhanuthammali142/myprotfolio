# ResumeAI

The ultimate ATS resume optimization platform.

## Features
- Smart Resume Parsing (PDF, DOCX, TXT)
- ATS Score Engine
- AI Keyword Gap Analysis
- AI-Powered Bullet Point & Summary Rewriting
- Cover Letter & Interview prep generation

## Quick Start (Local)

### Prerequisites
- Node.js 18+

### Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Setup Environment Variables:
   - Create `backend/.env` file
   - If using OpenAI, add your key: `OPENAI_API_KEY=your_key`
   - If no key is provided, the app runs in **Demo Mode** with placeholder responses.

3. Start Backend:
   ```bash
   cd backend
   npm run dev
   ```

4. Install Frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

5. Start Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. Open `http://localhost:5173`

## Docker Deployment (Google Cloud Run Ready)

Build and run using Docker Compose:
```bash
docker-compose up --build
```

Access the app at `http://localhost:5173`.
