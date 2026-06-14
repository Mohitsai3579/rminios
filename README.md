# 🌌 RMinios Research OS

RMinios is a premium, enterprise-grade AI Research Operating System. Built for academics, students, and professionals, it unifies document ingestion, multimodal AI chat (RAG), live academic database search, and 3D visualization into a single, seamless workspace.

---

## ✨ Key Features

### 1. 🤖 Sara: The Agentic Orchestrator
Sara is the core intelligence of RMinios, utilizing **Role-Based Access Control (RBAC)** to adapt her persona based on the user:
- **Unauthenticated Visitors:** Acts as a marketing agent, explaining the platform's benefits and providing dynamic support contact information.
- **Logged-in Users:** Acts as an Academic Research Assistant, strictly assisting with research tasks and navigating the dashboard while guarding system secrets.
- **Administrators:** Acts as a Senior Solutions Architect, providing full transparency on backend infrastructure, vector search algorithms, and system KPIs.
- *Note:* Sara's memory is securely isolated per user session to prevent cross-account memory bleeds.

### 2. 📂 Multi-Tenant Workspaces
Users can create isolated workspaces for different research projects (e.g., "Masters Thesis", "Quantum Physics Research"). 
- **Document Ingestion:** Upload PDFs directly to the workspace. Files are securely stored in Supabase Storage.
- **Vector Embeddings (RAG):** Uploaded documents are parsed and converted into vector embeddings, allowing users to chat directly with their documents for instant insights.
- **Workspace Management:** Users can seamlessly create, jump to, and completely delete workspaces and their associated data.

### 3. 🎓 Live Academic Search
The Workspace "Papers" tab integrates directly with the live **Cornell ArXiv XML API**. Users can search for topics (e.g., "Transformers", "Microplastics") and instantly stream real, up-to-date academic papers, including titles, authors, publication dates, and direct PDF links.

### 4. 🎛️ Administrative Control Panel
A powerful hub for platform owners:
- **Global Settings Configuration:** Powered by a dynamic SQL database, admins can update the platform's Owner Name, Support Email, and Support Phone number in real-time. These updates instantly propagate to the public landing page, the Support Center, and Sara's conversational memory.
- **Global Activity Radar:** A live feed monitoring every major action across the platform. Admins can see exactly when users create workspaces, upload documents, generate brainstorms, or start new chat sessions.

### 5. 🎨 Cinematic 3D User Interface
The public landing page is built with **React Three Fiber** and **Three.js**, featuring a dark-themed, highly interactive 3D WebGL hero section. Features are showcased in a "Bento Grid" using Framer Motion to provide premium, tactile 3D perspective hover effects.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Styling & Animation:** Tailwind CSS, Framer Motion, Vanilla CSS (for complex 3D perspective grids)
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Database & Authentication:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **AI Integration:** Google Generative AI (Gemini), Vercel AI SDK
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Environment Variables
Create a `.env.local` file in the root directory and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 2. Database Setup (Supabase)
Run the required SQL migrations in your Supabase SQL Editor:
- Initialize the `profiles`, `workspaces`, `files`, `chunks`, `conversations`, and `brainstorms` tables.
- Run the `site_settings.sql` migration to initialize the dynamic support configuration table:
  ```sql
  CREATE TABLE IF NOT EXISTS public.site_settings (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      support_email TEXT NOT NULL,
      support_phone TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );
  INSERT INTO public.site_settings (id, owner_name, support_email, support_phone)
  VALUES ('global', 'Your Name', 'support@example.com', '1234567890');
  ```

### 3. Run the Development Server
Install dependencies and start the app:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the 3D landing page!

---

## 🔒 Security Posture
- **Row Level Security (RLS):** Enforced across all Supabase tables ensuring users can only read/write data within their authorized workspaces.
- **Prompt Hardening:** Sara is strictly bounded by role-based system prompts to prevent unauthorized discovery of system architecture by non-admins.
- **Session Lockouts:** Stale sessions are automatically expired to protect user data.
