# Supabase Setup

## 1. Create project

- Create a free Supabase project
- In Authentication, enable `Anonymous Sign-Ins`
- In SQL Editor, run [`schema.sql`](/mnt/d/Projects/PersonalProjects/KanbanTaskBoard/supabase/schema.sql)

## 2. Add environment variables

Frontend `web/.env`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_BASE_URL=http://localhost:8080
```

Backend `api/.env`

```bash
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
FRONTEND_ORIGIN=http://localhost:5173
```

## 3. RLS behavior

- Anonymous users sign in automatically from the frontend
- Each request to the Go API includes the guest access token
- The Go API forwards that token to Supabase REST together with the project publishable key
- Supabase RLS policies ensure users can only access rows with their own `user_id`
