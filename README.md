# AI‑First CRM: HCP Log Interaction Module

This project implements an AI‑first Customer Relationship Management (CRM) module for Healthcare Professionals (HCPs), focused on a **Log Interaction** screen for field representatives. It supports both a **structured form** and an **AI‑assisted conversational chat interface** for logging and managing HCP interactions.

---

## 1. Features

### User Flows

- **Log Interaction (Form)**
  - Capture HCP name, specialty, channel, and interaction notes.
  - Persist data to a relational database.
- **Log Interaction (Chat)**
  - Free‑text input such as  
    `Log interaction with Dr. Smith, neurologist, phone: discussed migraine drug`.
  - AI agent extracts structured fields and stores them as an interaction.
- **Interaction History**
  - List of all interactions (form + chat).
  - Shows HCP, specialty, channel, notes, and timestamp.
  - Refresh button to fetch the latest data.

### AI Agent Tools (LangGraph)

The LangGraph agent exposes five tools:

1. **Log Interaction**  
   Extracts `hcp_name`, `specialty`, `channel`, and `raw_notes` from a natural language message and inserts a new interaction.

2. **Edit Interaction**  
   Command style: `Edit interaction 1: change channel to email`.  
   Resolves the interaction ID and updates the stored record.

3. **Get Interaction History**  
   Command style: `Show history for Dr. Smith`.  
   Returns a text history of previous interactions for that HCP.

4. **Suggest Next Best Action**  
   Command style: `Suggest next best action for Dr. Smith`.  
   Reads interaction history and suggests three concrete follow‑up actions.

5. **Summarize HCP Profile**  
   Command style: `Summarize profile for Dr. Smith`.  
   Produces a brief profile (interests, objections, preferred channel, talking points).

Routing logic in the agent decides, per message, whether to use one of the tools or just reply via the LLM.

---

## 2. Tech Stack

**Frontend**

- React (Create React App)
- Redux Toolkit, React Redux
- Axios

**Backend**

- Python 3
- FastAPI, Uvicorn
- SQLAlchemy, SQLite (can be switched to MySQL/Postgres)
- python‑dotenv

**AI / Agents**

- LangGraph
- LangChain Core / Community
- Groq Python SDK (`llama-3.3-70b-versatile`)

---

## 3. Project Structure

```text
ai-first-crm-hcp-module/
  backend/
    app/
      __init__.py
      config.py
      db.py
      models.py
      schemas.py
      tools.py
      langgraph_agent.py
      main.py
    requirements.txt
  frontend/
    src/
      api/
      components/
      pages/
      store/
      App.js
      index.js
      index.css
  README.md
```

---

## 4. Backend

### Configuration

`backend/app/config.py`:

- Loads environment variables from `.env`.
- Defaults `DATABASE_URL` to `sqlite:///./interactions.db`.
- Uses `GROQ_MODEL = "llama-3.3-70b-versatile"`.

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./interactions.db
```

`.gitignore` already ignores `.env`.

### Data Model

`backend/app/models.py` defines an `Interaction` table with:

- `id`
- `hcp_name`
- `specialty`
- `channel`
- `interaction_datetime`
- `raw_notes`
- optional `llm_summary`, `key_entities`, `next_steps`

### API Endpoints

`backend/app/main.py` exposes:

- `POST /api/interactions` – create interaction
- `GET /api/interactions` – list interactions
- `GET /api/interactions/{id}` – get a single interaction
- `PUT /api/interactions/{id}` – update an interaction
- `POST /api/chat` – send a chat message to the LangGraph agent

CORS is enabled for `http://localhost:3000`.

### LangGraph Agent

`backend/app/langgraph_agent.py`:

- Creates a Groq client using `GROQ_API_KEY`.
- Defines an LLM node with a CRM‑focused system prompt.
- Registers five tool nodes provided by `tools.py`.
- Uses a router function to map phrases like:
  - `"log interaction"` → Log Interaction tool
  - `"edit interaction"` → Edit Interaction tool
  - `"show history"` → Get Interaction History tool
  - `"next best action"` → Suggest Next Best Action tool
  - `"summarize profile"` → Summarize HCP Profile tool

`backend/app/tools.py` implements the database and LLM logic for each tool.

---

## 5. Frontend

### Screens

- **Log Interaction**
  - File: `frontend/src/components/InteractionForm.jsx`
  - Simple form to create interactions via `/api/interactions`.

- **Chat with AI Agent**
  - File: `frontend/src/components/ChatInterface.jsx`
  - Chat UI backed by Redux:
    - `addUserMessage` – add user bubble.
    - `sendChatMessage` – POST `/api/chat` and append assistant messages.

- **Interaction History**
  - File: `frontend/src/components/InteractionList.jsx`
  - Loads `/api/interactions` and displays them as cards.
  - Includes a Refresh button to re‑fetch data.

`frontend/src/pages/LogInteractionPage.jsx` combines these into a 3‑tab layout:
**Log Interaction / Chat / History**.

---

## 6. Running the Project

### Backend

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file **inside `backend/`** :

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./interactions.db
```

4. Start the backend server:

```bash
py -m uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` and interactive docs at `http://127.0.0.1:8000/docs`.

---

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm start
```

The frontend will run at `http://localhost:3000` and is configured to call the backend at `http://127.0.0.1:8000`.

## 7. Example Chat Commands

You can use the following in the **Chat** tab:

- `Log interaction with Dr. Smith, neurologist, phone: discussed migraine drug`
- `Show history for Dr. Smith`
- `Suggest next best action for Dr. Smith`
- `Summarize profile for Dr. Smith`
- `Edit interaction 1: change channel to email`