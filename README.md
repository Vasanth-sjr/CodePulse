# CodePulse — AI Developer Intelligence Platform

> Analyze developer impact, trace business requirements to code changes, and detect knowledge concentration risks — all powered by AI.

## 🏗️ Architecture

```
CodePulse/
├── backend/                  ← FastAPI Python backend
│   ├── main.py              ← Entry point
│   ├── requirements.txt     ← Python dependencies
│   ├── .env                 ← Environment variables
│   ├── routers/
│   │   ├── github.py        ← GitHub data fetching
│   │   ├── analysis.py      ← NLP + impact scoring
│   │   └── dashboard.py     ← Dashboard aggregator
│   ├── services/
│   │   ├── github_service.py ← GitHub API wrapper
│   │   ├── nlp_service.py    ← Sentence-transformers NLP
│   │   ├── impact_service.py ← Developer impact scoring
│   │   └── risk_service.py   ← Knowledge risk detection
│   └── models/
│       ├── db.py             ← SQLAlchemy models
│       └── schemas.py        ← Pydantic schemas
├── src/                      ← React + Vite frontend
│   ├── pages/               ← Dashboard pages
│   ├── components/          ← Shared UI components
│   └── services/api.js      ← API client
└── n8n/workflows/           ← n8n automation workflows
```

## 🚀 Quick Start

### 1. Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Run Frontend

```bash
# From project root
npm install
npm run dev
```

### 3. Run n8n (Optional)

```bash
npx n8n
# Import workflows from /n8n/workflows/
```

## 🔑 Environment Variables

Create `backend/.env`:

```env
GITHUB_TOKEN=your_personal_access_token
N8N_BASE_URL=http://localhost:5678
DATABASE_URL=sqlite:///./codepulse.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/github/fetch` | Fetch and store repo commit data |
| POST | `/api/analysis/requirements` | Run NLP requirement→commit mapping |
| GET | `/api/analysis/impact?repo_id=N` | Get developer impact scores |
| GET | `/api/analysis/risks?repo_id=N` | Get knowledge risk per module |
| GET | `/api/dashboard/summary?repo_id=N` | Get all dashboard data |

### API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤖 n8n Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `auto_refresh` | GitHub push webhook | Re-runs full analysis on new commits |
| `daily_digest` | Cron 9AM daily | Sends HIGH risk alerts to Slack/email |
| `jira_sync` | Cron every 6 hours | Pulls Jira issues → maps to commits |
| `pr_check` | GitHub PR webhook | Comments on PRs with traceability score |

## 🧠 How It Works

### Developer Impact Scoring

```
Impact = (commits × 0.4) + (files_changed × 0.3) 
       + (modules × 0.2) + (lines_changed × 0.1)
Normalized to 0–10 scale
```

### Knowledge Risk Detection

- **HIGH** ⚠️: Top developer owns ≥ 70% of module commits
- **MEDIUM**: Top developer owns 50–69%
- **LOW** ✓: No developer owns > 50%

### Requirement Traceability

Uses `sentence-transformers/all-MiniLM-L6-v2` for semantic similarity matching between business requirements and commit messages. Threshold: ≥ 45% similarity.

## 📋 Tech Stack

- **Frontend**: React 19, Vite, Recharts, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite
- **AI/ML**: Sentence Transformers, scikit-learn
- **Automation**: n8n workflows
