# Sanjeevani — Medical AI Platform

A self-hosted medical assistant demo with separate patient and doctor portals: AI chat backed by retrieval-augmented generation (RAG) over uploaded reports and prescriptions, risk-based doctor approval of AI answers, and appointment/notification workflows.

## 🌐 Live Demo

**Experience the Medical AI Platform**

**Live Website:** http://34.46.88.239/

> **Scope note:** this is a personal demo/portfolio project, not a real medical product. All patient and doctor data is fictitious.

---

## Table of contents
- [Flow Diagram](#Flow-Diagram)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Database schema](#database-schema)
- [Design decisions](#design-decisions)
- [Known limitations](#known-limitations--roadmap)
- [Testing](#testing)

---
## Flow Diagram

<img width="512" height="768" alt="image" src="https://github.com/user-attachments/assets/aff86526-5a03-4a58-8c54-f220098a9762" />


---
## Features

- **Dual portals** — separate patient and doctor experiences behind a single role-based auth system
- **AI chat with RAG** — answers are grounded in a curated reference corpus via pgvector similarity search
- **Document understanding** — upload PDFs or images (prescriptions, reports); OCR extracts text asynchronously and feeds it into the chat context
- **Risk-based doctor approval** — clinical AI answers to patients are queued for doctor review; non-clinical replies (greetings, logistics) go straight through
- **Swappable LLM backend** — runs fully self-hosted on a local model by default, with optional routing to a hosted model for lower latency
- **Appointment workflow** — patients request appointments; doctors approve or reject them
- **Multi-language support** — chat responses can be generated in the user's selected language

---

## Architecture

![Architecture](architecture.svg)

A reverse proxy is the only publicly exposed service. It routes API traffic to the backend and everything else to the static frontend build. The backend talks to a Postgres database (with the `pgvector` extension for embeddings) and a local LLM runtime for chat and embeddings. Chat generation can optionally be routed to a hosted LLM API instead, without changing the rest of the application — embeddings always stay local.

All inter-service traffic is kept off the public network; only the reverse proxy's port is reachable from outside the host.

---

## Tech stack

**Backend**
- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.0 + Alembic migrations
- PostgreSQL with `pgvector` (embeddings) and `pgcrypto`
- LangGraph for agent orchestration
- JWT auth (`python-jose`) + bcrypt password hashing
- OCR via `pdfplumber` (text PDFs) and `pytesseract`/`Pillow` (images)
- Tests with `pytest`

**Frontend**
- React 19 + TypeScript, built with Vite
- `react-router-dom` for routing
- Hand-written CSS with custom properties, including dark-mode support
- Session state via React Context, backed by `sessionStorage`

**AI / LLM**
- Local model runtime for chat (swappable model) and embeddings — fully self-hosted by default
- Optional hosted LLM API for chat generation when a key is configured (embeddings remain local, since that was never the latency bottleneck)
- RAG over a small curated corpus of reference documents, ingested via an offline script

**Infrastructure**
- Docker Compose (reverse proxy, frontend, backend, database, local LLM runtime)
- Reverse proxy with auto-HTTPS capability
- Runs identically in local development and on a deployed host

---

## Project structure

```
medical-ai-platform/
├── docker-compose.yml
├── .env.example
├── db/init/                  # DB extensions bootstrap (vector, pgcrypto)
├── reverse-proxy/             # reverse proxy config
├── corpus/                    # reference documents for RAG (not committed)
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, routing
│   │   ├── core/               # security (JWT, hashing), ID generation
│   │   ├── db/                 # SQLAlchemy base + models
│   │   ├── schemas/             # pydantic request/response models
│   │   ├── api/routes/          # auth, chats, uploads, doctor, appointments, actions
│   │   ├── agent/                # LangGraph orchestrator, nodes, tools
│   │   └── services/             # OCR, file storage, notification placeholder
│   ├── alembic/versions/         # migrations
│   ├── scripts/ingest_corpus.py  # RAG corpus ingestion
│   └── tests/
│
└── frontend/
    └── src/
        ├── api/                  # typed API client
        ├── auth/                  # auth context + route guards
        ├── components/            # chat UI, uploads, navigation
        └── pages/
            ├── patient/
            └── doctor/
```

### Chat message flow

```
Browser → API client (attaches auth token)
   → POST /api/v1/chats/{id}/messages
       → auth + ownership checks
       → save user message
       → LangGraph orchestrator:
           retrieve  → embed query, pgvector similarity search over reference corpus
           respond   → single LLM call returns category, clinical flag, and answer
       → approval gating (see Design decisions)
       → save assistant message (+ review record if gated)
   → frontend updates optimistically, then reconciles with the saved message
```

---

## Getting started

### Prerequisites
- Docker + Docker Compose
- Node.js 22+ (only for frontend dev outside Docker)
- Python 3.12 (only for running backend tests outside Docker)

### Run the full stack locally

```bash
git clone https://github.com/DeepakKumardpk/medical-ai-platform.git
cd medical-ai-platform
cp .env.example .env          # fill in your own values, see Environment variables below

docker compose up -d

# one-time: pull the local models used by the app
docker compose exec ollama ollama pull llama3.2:3b
docker compose exec ollama ollama pull nomic-embed-text

# one-time: run database migrations
docker compose exec backend alembic upgrade head

# optional: ingest the RAG corpus (place PDFs in ./corpus/ first)
docker compose exec backend python scripts/ingest_corpus.py
```

The app is then reachable at `http://localhost`.

### Frontend-only dev loop (hot reload)

```bash
cd frontend
npm install
npm run dev
```

Requires the backend and its dependencies already running, e.g. `docker compose up -d postgres ollama backend`.

---

## Environment variables

Configured via `.env` (see `.env.example` for the full template — real secrets are never committed).

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials and name |
| `DATABASE_URL` | SQLAlchemy connection string used by the backend |
| `JWT_SECRET_KEY` | Signing secret for auth tokens — use a strong random value |
| `JWT_ALGORITHM` | JWT signing algorithm (`HS256`) |
| `JWT_EXPIRE_MINUTES` | Access token lifetime |
| `OLLAMA_BASE_URL` | Address of the local LLM runtime |
| `OLLAMA_LLM_MODEL` | Chat model served locally when no hosted API key is set |
| `OLLAMA_EMBED_MODEL` | Embedding model — always local, regardless of chat backend |
| `ANTHROPIC_API_KEY` | Optional — if set, chat routes through a hosted model instead of the local one; leave blank for a fully self-hosted setup |
| `ANTHROPIC_MODEL` | Hosted model name to use when the key above is set |
| `UPLOAD_DIR` | Path where uploaded files are stored inside the backend container |
| `DEV_AUTO_APPROVE` | When `true`, bypasses the doctor-approval queue for local testing only — keep `false` otherwise |

The frontend has its own build-time variable, `VITE_API_BASE_URL`, pointing at the API base path (relative in the Docker build, or a local backend URL during standalone frontend dev).

---

## API overview

All routes except registration/login require a bearer token.

**Auth**
- `POST /auth/register/patient`, `POST /auth/register/doctor`
- `POST /auth/login`
- `GET /auth/me`

**Chats**
- `POST /chats`, `GET /chats`, `GET /chats/{chat_id}`
- `POST /chats/{chat_id}/messages` — posts a message and returns the AI reply (subject to approval gating)

**Uploads**
- `POST /chats/{chat_id}/uploads` — upload a PDF or image; kicks off OCR asynchronously
- `GET /jobs/{job_id}` — poll upload/OCR job status

**Doctor** (doctor role only)
- `GET /doctor/patients/{public_id}/history`
- `GET /doctor/approvals`
- `POST /doctor/approvals/{approval_id}/decision` — approve, edit, or reject a pending AI answer
- `POST /doctor/tools/drug-interaction` — RAG-backed drug interaction lookup

**Appointments**
- `POST /appointments`
- `POST /appointments/{id}/approve` / `POST /appointments/{id}/reject`

**Misc**
- `GET /health`

---

## Database schema

PostgreSQL with `pgvector`. A single `users` table with a `role` enum (patient/doctor) keeps auth logic uniform; doctor-only fields are nullable.

| Table | Purpose |
|---|---|
| `users` | Accounts for both patients and doctors, with a human-readable public ID |
| `chats` | One row per conversation thread |
| `messages` | Chat messages, including approval status for gated AI answers |
| `documents` | Uploaded files and their extracted text (kept private, used only as LLM context) |
| `jobs` | Tracks the async upload → OCR → confirmation pipeline |
| `approvals` | The doctor review queue for gated AI answers |
| `appointments` | Patient-requested appointments and their status |
| `email_log` | Records notifications that would be sent (no real email provider wired up yet) |
| `corpus_chunks` | The RAG store — chunked reference text with embeddings |

---

## Design decisions

- **Single `users` table with a role enum** instead of separate patient/doctor tables, to keep auth logic uniform.
- **Risk-based approval, not blanket approval.** Every AI reply is classified as clinical or not in the same LLM call that generates it; only clinical replies to patients are queued for doctor review. Parsing failures default to "requires review" so nothing slips through unreviewed. Uploaded documents are always treated as clinical.
- **One merged LLM call** produces the category, the clinical flag, and the answer together, instead of several sequential calls — this was the main lever for cutting response latency.
- **Swappable LLM backend behind one function** — the rest of the app never branches on which chat provider is active. Embeddings always stay on the local model, since a hosted provider may not offer embeddings and this was never the slow part.
- **Uploaded document text is never shown to the user directly** — only a short confirmation message is posted; the extracted text is used solely as private LLM context.
- **Optimistic UI** — messages appear immediately on send and reconcile once the real response arrives.
- **Background tasks instead of a dedicated queue/broker** for OCR processing, appropriate at this project's current scale.

---

## Known limitations / roadmap

- No admin gating on doctor self-registration — fine for a demo, would need real verification before production use
- Email/notification actions are logged only — no real provider integration yet
- PDF OCR falls back to an empty result for scanned/text-less PDFs rather than rasterizing first
- No caching layer, tracing, or monitoring stack yet
- RAG corpus is a small, manually curated, manually re-ingested set of local documents — no live external lookups
- No queue/broker for background work; an in-flight OCR job is lost if the backend restarts mid-task
- CORS is currently permissive — should be locked down before any real deployment
- Single-instance deployment — no horizontal scaling or managed database yet
- No automated frontend test suite yet (backend has `pytest` coverage)
- No CI pipeline — tests and deploys are currently run manually

---

## Testing

```bash
# inside the backend container
docker compose exec backend pytest

# or locally with Python 3.12 + tesseract installed
cd backend
pip install -r requirements.txt
pytest
```

Backend coverage includes OCR text extraction and RAG retrieval correctness. Frontend currently has linting (`npm run lint`) but no automated test suite — verified manually by running the app locally.
