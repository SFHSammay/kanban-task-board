# Kanban Task Board

A polished Kanban task board built with:

- `web/`: React + TypeScript frontend
- `api/`: Go API for task CRUD/update endpoints
- `supabase/`: SQL schema, RLS policies, and setup notes

## Features

- Anonymous guest auth with Supabase
- Kanban board with drag-and-drop columns
- Task creation with title, description, priority, due date
- Search, priority filtering, and board stats
- Responsive layout with loading, empty, and error states
- Compact top toolbar with board actions and summary cards
- Overlay task creation form
- Go API that forwards authenticated requests into Supabase so RLS stays enforced

## Tech stack

- Frontend: React, TypeScript, Vite, `@dnd-kit`
- Backend: Go standard library HTTP server
- Auth and database: Supabase
- Deployment: Vercel (frontend) + Render (backend)

## Local development

1. Create a Supabase project.
2. Enable `Anonymous Sign-Ins` in Supabase Auth.
3. Run [`supabase/schema.sql`](/mnt/d/Projects/PersonalProjects/KanbanTaskBoard/supabase/schema.sql) in the Supabase SQL Editor.
4. Copy env files:
   - `cp web/.env.example web/.env`
   - `cp api/.env.example api/.env`
5. Fill in the real values in both `.env` files.
6. Start the API:
   - `cd api && go run ./cmd/server`
7. Start the frontend:
   - `cd web && npm install && npm run dev`
8. Open `http://localhost:5173`

## Environment variables

Frontend:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: browser-safe Supabase publishable key
- `VITE_API_BASE_URL`: Go API base URL, usually `http://localhost:8080` locally

Backend:

- `PORT`: API port, usually `8080` locally
- `SUPABASE_URL`: same Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY`: same low-privilege publishable key used for Supabase REST access
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS, usually `http://localhost:5173`

## Deployment

- Frontend: Vercel
- Backend: Render
- Database and auth: Supabase
