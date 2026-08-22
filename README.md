# Dani's Art Registry

An art registry web application where artwork sales are visualized as furniture in a room. When customers buy art, Dani gets the furniture displayed on the floor map.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Python + FastAPI
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **Hosting:** GitHub Pages (frontend) + Render (backend)

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Supabase account

### Frontend

```bash
cd frontend
cp .env.example .env  # Then fill in your Supabase credentials
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Then fill in your credentials
uvicorn main:app --reload
```

## Deployment

- **Frontend:** Automatically deployed to GitHub Pages on push to main
- **Backend:** Connect GitHub repo to Render, it will use `render.yaml`

## Project Structure

```
dani_art/
├── frontend/          # React + TypeScript app
├── backend/           # FastAPI Python server
├── supabase/          # Database migrations
└── docs/              # Product requirements
```

## License

Private project - a gift for Dani
