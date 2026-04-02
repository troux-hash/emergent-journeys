## Fichua Intranet — Phased Build Plan

### Phase 1: Foundation & Layout
- Create `/intranet` route protected by admin auth
- Build intranet layout with sidebar navigation (Dashboard, Documents, Tasks)
- Reuse existing admin auth system (login + role check)

### Phase 2: Dashboard
- Overview page with key metrics cards (placeholder data initially)
- Quick links to other intranet sections

### Phase 3: Document Sharing & Wiki
- **Database**: `intranet_documents` table (title, content as rich text/markdown, category, created_by, updated_at)
- Create, edit, and view documents/SOPs
- Organize by categories/folders
- Search functionality

### Phase 4: Task/Project Management
- **Database**: `intranet_tasks` table (title, description, status, priority, assigned_to, due_date, project)
- `intranet_projects` table (name, description, status)
- Kanban-style board (To Do → In Progress → Done)
- Assign tasks to team members, set deadlines

### Phase 5: Polish
- RLS policies on all tables (admin-only access)
- Responsive design for mobile use

### Security
- All intranet routes require authenticated admin users
- All tables have RLS restricted to admin role
