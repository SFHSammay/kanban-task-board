# Kanban Task Board

A polished Kanban-style task board built for an internship assessment with:

- `web/`: React + TypeScript frontend
- `api/`: Go API for task CRUD/update endpoints
- `supabase/`: SQL schema, RLS policies, and setup notes

## Features

- Anonymous guest auth with Supabase
- Kanban board with drag-and-drop columns
- Task creation with title, description, priority, due date
- Search, priority filtering, and board stats
- Responsive layout with loading, empty, and error states
- Go API that forwards authenticated requests into Supabase so RLS stays enforced

## Local development

1. Create Supabase project and run [`supabase/schema.sql`](/mnt/d/Projects/PersonalProjects/KanbanTaskBoard/supabase/schema.sql)
2. Copy env files:
   - `cp web/.env.example web/.env`
   - `cp api/.env.example api/.env`
3. Start the API:
   - `cd api && go run ./cmd/server`
4. Start the frontend:
   - `cd web && npm install && npm run dev`

## Environment variables

Frontend:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key for browser-safe client access
- `VITE_API_BASE_URL`: Go API base URL, usually `http://localhost:8080`

Backend:

- `SUPABASE_URL`: same Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY`: same publishable key used for low-privilege API access
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS, usually `http://localhost:5173`

## Deployment

- Frontend: Vercel / Netlify / Cloudflare Pages
- API: Render / Fly.io / Railway
