# Legacy Transformer

Layer Tool Purpose

Frontend Lovable AI-powered React + TypeScript + TailwindCSS UI builder

Backend Google Antigravity AI agent backend development, Cloud Run deploy

Database & Auth Supabase Postgres DB, authentication, storage, edge functions

AI Migration Engine IBM Bob 2.0 COBOL analysis, migration planning, parallel refactoring

Rapid Prototyping Google AI Studio Gemini-powered prototyping

Design Google Stitch UI design draftslegacy-pilot/

├── frontend/                          # Lovable-generated React app

│   ├── src/

│   │   ├── components/

│   │   │   ├── MigrationDashboard.tsx

│   │   │   ├── CodeViewer.tsx

│   │   │   ├── ProgressTracker.tsx

│   │   │   └── ImpactAnalysis.tsx

│   │   ├── pages/

│   │   │   ├── Dashboard.tsx

│   │   │   ├── Migrate.tsx

│   │   │   └── Reports.tsx

│   │   ├── lib/

│   │   │   └── supabase.ts

│   │   └── App.tsx

│   ├── package.json

│   └── .env.local

│

├── backend/                           # Antigravity-generated backend

│   ├── src/

│   │   ├── routes/

│   │   │   ├── migration.ts

│   │   │   ├── analysis.ts

│   │   │   └── impact.ts

│   │   ├── services/

│   │   │   ├── bobService.ts

│   │   │   ├── supabaseService.ts

│   │   │   └── migrationEngine.ts

│   │   └── index.ts

│   ├── package.json

│   └── Dockerfile

│

├── bob-engine/                        # IBM Bob COBOL migration engine

│   ├── prompts/

│   │   ├── 01-analysis.txt

│   │   ├── 02-planning.txt

│   │   ├── 03-refactoring.txt

│   │   └── 04-impact.txt

│   ├── sessions/

│   │   └── bob_sessions/

│   │       ├── 01-analysis-ask-mode.md

│   │       ├── 02-plan-mode-migration.md

│   │       ├── 03-agent-parallel-refactor.md

│   │       ├── 04-subagent-impact.md

│   │       ├── 05-validation-docs.md

│   │       └── screenshots/

│   └── output/

│       └── migrated-java/

│

├── supabase/

│   ├── migrations/

│   │   └── 001_initial_schema.sql

│   └── functions/

│       └── migrate/

│           └── index.ts

│

├── docs/

│   ├── architecture.md

│   └── migration-mapping.md

│

├── prompts.txt

├── README.md

└── AGENTS.mdVanakkam! Ippo naan ungaluku LegacyPilot project ku full end-to-end build plan kudukkuren — frontend, backend, database, AI integration ellame. Ithu "forward deployed engineering" style la irukkum: quick to build, AI tools use panni, and production-ready.

---

🏗️ Technology Stack Overview

Layer Tool Purpose

Frontend Lovable AI-powered React + TypeScript + TailwindCSS UI builder

Backend Google Antigravity AI agent backend development, Cloud Run deploy

Database & Auth Supabase Postgres DB, authentication, storage, edge functions

AI Migration Engine IBM Bob 2.0 COBOL analysis, migration planning, parallel refactoring

Rapid Prototyping Google AI Studio Gemini-powered prototyping

Design Google Stitch UI design drafts

Quick Build Strategy: Lovable la frontend build pannunga → Supabase la database setup pannunga → Antigravity la backend build pannunga → IBM Bob la COBOL migration engine build pannunga → Ellathayum connect pannunga.

📁 Complete Folder Structure

```

legacy-pilot/

├── frontend/                          # Lovable-generated React app

│   ├── src/

│   │   ├── components/

│   │   │   ├── MigrationDashboard.tsx

│   │   │   ├── CodeViewer.tsx

│   │   │   ├── ProgressTracker.tsx

│   │   │   └── ImpactAnalysis.tsx

│   │   ├── pages/

│   │   │   ├── Dashboard.tsx

│   │   │   ├── Migrate.tsx

│   │   │   └── Reports.tsx

│   │   ├── lib/

│   │   │   └── supabase.ts

│   │   └── App.tsx

│   ├── package.json

│   └── .env.local

│

├── backend/                           # Antigravity-generated backend

│   ├── src/

│   │   ├── routes/

│   │   │   ├── migration.ts

│   │   │   ├── analysis.ts

│   │   │   └── impact.ts

│   │   ├── services/

│   │   │   ├── bobService.ts

│   │   │   ├── supabaseService.ts

│   │   │   └── migrationEngine.ts

│   │   └── index.ts

│   ├── package.json

│   └── Dockerfile

│

├── bob-engine/                        # IBM Bob COBOL migration engine

│   ├── prompts/

│   │   ├── 01-analysis.txt

│   │   ├── 02-planning.txt

│   │   ├── 03-refactoring.txt

│   │   └── 04-impact.txt

│   ├── sessions/

│   │   └── bob_sessions/

│   │       ├── 01-analysis-ask-mode.md

│   │       ├── 02-plan-mode-migration.md

│   │       ├── 03-agent-parallel-refactor.md

│   │       ├── 04-subagent-impact.md

│   │       ├── 05-validation-docs.md

│   │       └── screenshots/

│   └── output/

│       └── migrated-java/

│

├── supabase/

│   ├── migrations/

│   │   └── 001_initial_schema.sql

│   └── functions/

│       └── migrate/

│           └── index.ts

│

├── docs/

│   ├── architecture.md

│   └── migration-mapping.md

│

├── prompts.txt

├── README.md

└── AGENTS.md

```

🚀 Step-by-Step Build Guide

Phase 1: Supabase Setup (10 minutes)

Step 1: supabase.com la account create pannunga. Free tier enough.

Step 2: New project create pannunga. Project name: legacy-pilot.

Step 3: Database tables create pannunga. Supabase SQL Editor la paste pannunga:

```sql

-- Migration jobs table

CREATE TABLE migration_jobs (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  name TEXT NOT NULL,

  status TEXT DEFAULT 'pending',

  cobol_source TEXT,

  java_output TEXT,

  progress INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  updated_at TIMESTAMP DEFAULT NOW()

);

-- Migration phases table

CREATE TABLE migration_phases (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  job_id UUID REFERENCES migration_jobs(id),

  phase_name TEXT NOT NULL,

  phase_order INTEGER,

  status TEXT DEFAULT 'pending',

  bob_session_id TEXT,

  output TEXT,

  created_at TIMESTAMP DEFAULT NOW()

);

-- Impact analysis table

CREATE TABLE impact_analysis (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  job_id UUID REFERENCES migration_jobs(id),

  affected_program TEXT,

  impact_level TEXT,

  details TEXT,

  created_at TIMESTAMP DEFAULT NOW()

);

-- Bob sessions table

CREATE TABLE bob_sessions (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  job_id UUID REFERENCES migration_jobs(id),

  mode TEXT,

  prompt TEXT,

  response TEXT,

  screenshot_url TEXT,

  created_at TIMESTAMP DEFAULT NOW()

);

```

Step 4: Project URL and anon key ah copy pannunga. Settings → API la irukku.

Phase 2: Frontend Build with Lovable (30 minutes)

Step 1: lovable.dev la account create pannunga. GitHub la sign up pannunga.

Step 2: New project create pannunga. Chat la ithu paste pannunga:

```

Build a LegacyPilot dashboard — an AI-powered legacy code migration tool.

Requirements:

- Dashboard page showing migration jobs (name, status, progress bar)

- Migrate page with COBOL code input textarea and "Start Migration" button

- Reports page showing impact analysis and before/after metrics

- Code viewer with side-by-side COBOL (left) and Java (right) panes

- Progress tracker showing migration phases

- Connect to Supabase for data storage

Design: Dark theme, developer-focused, monospace for code.

Use React + TypeScript + TailwindCSS.

```

Step 3: Lovable project generate pannum. Plan mode use pannunga — project aware, files inspect pannum, clarifying questions kekkum.

Step 4: Supabase connect pannunga. Lovable la Settings → Integrations → Supabase ku po. Unga Supabase project URL and anon key paste pannunga.

Step 5: Chat la ithu type pannunga:

```

Connect the dashboard to Supabase migration_jobs table.

Show all jobs with status badges and progress bars.

Add a "New Migration" button that creates a new job record.

```

Step 6: Publish pannunga. Lovable la Publish button click pannunga. URL kedaikkum.

Phase 3: Backend Build with Antigravity (45 minutes)

Step 1: Antigravity install pannunga (VS Code extension or standalone).

Step 2: New workspace create pannunga. Backend folder open pannunga.

Step 3: Antigravity ku Supabase access kudukkunga. Settings → Customizations → Open MCP Config. Ithu add pannunga:

```json

{

  "mcpServers": {

    "supabase": {

      "url": "https://mcp.supabase.com/mcp",

      "env": {

        "SUPABASE_URL": "your-project-url",

        "SUPABASE_SERVICE_KEY": "your-service-key"

      }

    }

  }

}

```

Step 4: Antigravity la ithu type pannunga:

```

Create a backend API for LegacyPilot with these endpoints:

1. POST /api/migration/start — Start a new COBOL migration job

2. GET /api/migration/:id — Get migration job status

3. POST /api/migration/:id/phase — Run a specific migration phase

4. GET /api/impact/:id — Get impact analysis results

5. POST /api/analysis — Analyze COBOL code with IBM Bob

Use Express.js + TypeScript.

Connect to Supabase for data storage.

Use the Supabase MCP to inspect the schema and generate correct queries.

Deploy to Cloud Run.

```

Step 5: Antigravity code generate pannum. Supabase MCP automatically inspect pannum, correct table names suggest pannum.

Step 6: Deploy pannunga. Antigravity la Cloud Run deploy command generate pannum.

Phase 4: IBM Bob Migration Engine (1 hour)

Step 1: Bob IDE v2.0.2+ install pannunga.

Step 2: AWS CardDemo clone pannunga:

```bash

git clone https://github.com/aws-samples/aws-mainframe-modernization-carddemo

cd aws-mainframe-modernization-carddemo

```

Step 3: /init command run pannunga. Bob repository scan panni AGENTS.md create pannum.

Step 4: Bob la Phase 1 prompts run pannunga:

```

Analyze this COBOL codebase. Explain the business logic in COSGN00C (sign-on screen), COMEN01C (main menu), and COACTVWC (account view). What are the key data flows and dependencies? Provide a natural language summary.

```

Step 5: Screenshots eduthu bob_sessions/screenshots/ la save pannunga.

Step 6: Ellathayum migrate pannunga — Phase 1 to Phase 5 varai. Each session ku markdown file create pannunga (bob_sessions/01-analysis-ask-mode.md, etc.).

Step 7: Migrated Java code ah bob-engine/output/migrated-java/ la export pannunga.

Phase 5: Integration — Ellathayum Connect Pannunga (30 minutes)

Step 1: Frontend → Backend connect pannunga. Lovable la chat la type pannunga:

```

Connect the "Start Migration" button to POST https://your-backend-url/api/migration/start

Send the COBOL code and job name.

Show loading state and success message.

```

Step 2: Backend → Bob connect pannunga. Antigravity la type pannunga:

```

Add IBM Bob API integration to the migration service.

When a migration job starts, call Bob with the COBOL code.

Bob analyzes and returns migration plan.

Store the plan in migration_phases table.

```

Step 3: Backend → Supabase connect pannunga. Antigravity la type pannunga:

```

Add Supabase real-time subscription to the backend.

When migration_jobs status changes, broadcast to connected clients.

```

Step 4: Frontend → Supabase real-time connect pannunga. Lovable la type pannunga:

```

Subscribe to real-time updates on migration_jobs table.

When progress changes, update the dashboard automatically.

```

Phase 6: Optional AI Tools for Speed

Tool Use Case Link

Google AI Studio Gemini-powered code analysis prototyping ai.google.dev

Google Stitch UI design drafts before Lovable stitch.google.com

Claude Design Interactive prototypes from text claude.ai

Trae Design Mode AI-based design drafting trae.ai

📊 Final Architecture

```

┌─────────────────────────────────────────────────────────┐

│                    LOVABLE (Frontend)                    │

│  React + TypeScript + TailwindCSS                       │

│  Dashboard | Migrate | Reports | Code Viewer            │

└────────────────────┬────────────────────────────────────┘

                     │ REST API + WebSocket

┌────────────────────▼────────────────────────────────────┐

│              ANTIGRAVITY (Backend)                       │

│  Express.js + TypeScript | Cloud Run Deploy             │

│  /migration | /analysis | /impact | /phases             │

└────────────────────┬────────────────────────────────────┘

                     │ MCP (Model Context Protocol)

┌────────────────────▼────────────────────────────────────┐

│               SUPABASE (Database)                        │

│  Postgres | Auth | Storage | Edge Functions             │

│  migration_jobs | migration_phases | impact_analysis    │

└────────────────────┬────────────────────────────────────┘

                     │ API Calls

┌────────────────────▼────────────────────────────────────┐

│              IBM BOB 2.0 (Migration Engine)              │

│  Ask Mode | Plan Mode | Agent Mode | Subagents          │

│  COBOL Analysis → Migration Plan → Java Output          │

└─────────────────────────────────────────────────────────┘

```

⏰ Quick Build Timeline (Total: ~4 Hours)

Phase Tool Time Output

1 Supabase 10 min Database + Auth ready

2 Lovable 30 min Frontend deployed

3 Antigravity 45 min Backend deployed

4 IBM Bob 1 hr Migration engine ready

5 Integration 30 min Everything connected

6 Testing 30 min End-to-end working

7 Submission prep 30 min README + video + slides

💡 Pro Tips

1. Lovable la Plan mode use pannunga — implementation ku munnadi architecture confirm pannum

2. Antigravity la Supabase MCP use pannunga — live schema inspect panni correct queries generate pannum

3. Bob la /init repeat pannunga after code changes

4. Screenshots eduthu bob_sessions/ la save pannunga — mandatory submission requirement

5. Git commit frequently — rollback safety net

---

Ithu than full end-to-end plan. Ippo start pannunga! Edhavadhu block aana, sollunga — naan help pannuren. 🚀

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8362dd0-c027-5279-a0f9-2895a328ea2b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
