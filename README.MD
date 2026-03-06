# GenAI Stack

A No-Code/Low-Code platform to visually build and run AI workflows using drag-and-drop components.

---

## Project Structure

```
genai-stack/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docker-compose.yml
└── .env              # Root env for docker-compose
```

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload
# Runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs at http://localhost:3000
```

---

## Docker Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Set up environment variables
Copy and fill in the root `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 2. Build and run
```bash
docker-compose up --build
```

### 3. Access the app
| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

### 4. Stop
```bash
docker-compose down
```

### 5. Stop and remove volumes
```bash
docker-compose down -v
```

---

## Environment Variables

| Variable         | Description                          |
|------------------|--------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string (Neon)  |
| `OPENAI_API_KEY` | OpenAI API key                       |
| `GEMINI_API_KEY` | Google Gemini API key                |
| `SERPAPI_KEY`    | SerpAPI key for web search           |
| `BRAVE_API_KEY`  | Brave Search API key                 |
| `SECRET_KEY`     | App secret key                       |

---

## API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/stacks/`            | List all stacks                |
| POST   | `/stacks/`            | Create a stack                 |
| GET    | `/stacks/{id}`        | Get a stack                    |
| PATCH  | `/stacks/{id}`        | Update / save workflow         |
| DELETE | `/stacks/{id}`        | Delete a stack                 |
| POST   | `/documents/upload`   | Upload & embed a PDF           |
| GET    | `/documents/{stack_id}` | List documents               |
| DELETE | `/documents/{doc_id}` | Delete a document              |
| POST   | `/workflow/run`       | Run full AI pipeline           |
| GET    | `/chat/{stack_id}`    | Get chat history               |
| DELETE | `/chat/{stack_id}`    | Clear chat history             |

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React.js, React Flow              |
| Backend     | FastAPI, SQLAlchemy (async)       |
| Database    | PostgreSQL (Neon)                 |
| Vector DB   | ChromaDB                          |
| Embeddings  | OpenAI / Gemini                   |
| LLM         | OpenAI GPT, Google Gemini         |
| Web Search  | SerpAPI, Brave Search             |
| PDF Extract | PyMuPDF                           |
| Container   | Docker, Docker Compose            |