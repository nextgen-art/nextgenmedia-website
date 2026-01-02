# NextGen Media Agency - Web Application

A modern media agency website built with React, TypeScript, Vite, and Supabase.

## 🚀 Quick Start

See the [Quick Start Guide](./docs/QUICK_START.md) for detailed setup instructions.

## 📁 Project Structure

```
nextGenmedia_web/
├── docs/                    # Documentation files
│   ├── QUICK_START.md      # Start here for setup
│   ├── FIGMA_TO_LOVABLE_GUIDE.md
│   ├── LOVABLE_SETUP_GUIDE.md
│   └── ...
├── src/                     # Source code
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   └── pages/             # Page components
├── supabase/               # Supabase configuration
│   ├── functions/         # Edge functions
│   └── SUPABASE_SCHEMA.sql # Database schema
├── public/                 # Static assets
├── workflows/             # n8n workflow definitions
└── dist/                  # Build output
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router
- **Forms**: React Hook Form, Zod
- **State Management**: TanStack Query

## 📚 Documentation

All documentation is located in the [`docs/`](./docs/) directory:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started quickly
- **[Figma to Lovable Guide](./docs/FIGMA_TO_LOVABLE_GUIDE.md)** - Import designs from Figma
- **[Lovable Setup Guide](./docs/LOVABLE_SETUP_GUIDE.md)** - Text-based setup instructions
- **[Post Clone Setup](./docs/POST_CLONE_SETUP.md)** - What to do after cloning
- **[Email Setup Guide](./docs/EMAIL_SETUP_GUIDE.md)** - Configure email functionality
- **[Contact Form Status](./docs/CONTACT_FORM_STATUS.md)** - Contact form implementation details

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Quality
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## 🔧 Configuration

- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Vite**: `vite.config.ts`
- **Tailwind**: `tailwind.config.ts`
- **ESLint**: `eslint.config.js`
- **PostCSS**: `postcss.config.js`
- **Components**: `components.json` (shadcn/ui config)
- **MCP**: `.mcp.json` (Model Context Protocol servers)
- **Netlify**: `netlify.toml` (deployment config)

## 🗄️ Database

The database schema is defined in [`supabase/SUPABASE_SCHEMA.sql`](./supabase/SUPABASE_SCHEMA.sql).

## 🔐 Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Dependencies

See [`package.json`](./package.json) for a complete list of dependencies.

## 🤖 Automation

Workflow automation is handled by n8n. See [`workflows/README.md`](./workflows/README.md) for details.

## 📝 License

Private project - All rights reserved.



