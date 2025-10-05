# Radiorogue Monorepo

AI-powered news aggregation platform combining frontend (Next.js) and backend (Express) in a unified monorepo.

## 📁 Project Structure

```
radiorogue/
├── apps/
│   ├── backend/          # Express.js API server
│   └── frontend/         # Next.js application
├── package.json          # Monorepo root with npm workspaces
└── .git/                 # Unified git repository
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Run frontend dev server
npm run dev:frontend

# Run backend dev server (after adding dev script to backend)
npm run dev:backend
```

### Build
```bash
# Build both apps
npm run build

# Build individually
npm run build:frontend
npm run build:backend
```

### Production
```bash
# Start frontend
npm run start:frontend

# Start backend
npm run start:backend
```

## 📦 Available Scripts

- `npm run dev:frontend` - Start Next.js dev server
- `npm run build:frontend` - Build frontend for production
- `npm run start:frontend` - Start frontend production server
- `npm run lint:frontend` - Run ESLint on frontend
- `npm run clean` - Remove all node_modules and build artifacts

## 🔧 Workspace Configuration

This monorepo uses **npm workspaces** for dependency management. All dependencies are hoisted to the root `node_modules` directory, with workspace-specific packages installed locally.

## 📝 Next Steps

### 1. GitHub Setup
You have three options:

**Option A: Create new GitHub repo (Recommended)**
```bash
# On GitHub, create new repo: radiorogue
# Then:
git add .
git commit -m "chore: initialize monorepo structure"
git remote add origin https://github.com/pavankommi/radiorogue.git
git push -u origin main
```

**Option B: Use existing frontend repo**
```bash
# Rename radiorogue-frontend → radiorogue on GitHub
# Update remote URL
git remote add origin https://github.com/pavankommi/radiorogue.git
git add .
git commit -m "chore: convert to monorepo with backend and frontend"
git push -u origin main --force
```

**Option C: Use existing backend repo**
```bash
# Rename radiorogue-backend → radiorogue on GitHub
git remote add origin https://github.com/pavankommi/radiorogue.git
git add .
git commit -m "chore: convert to monorepo with backend and frontend"
git push -u origin main --force
```

### 2. Archive Old Repositories
After successfully pushing the monorepo:
- Archive `radiorogue-backend` and `radiorogue-frontend` repos on GitHub
- Add a README redirect to the new monorepo location
- Keep them public for reference but mark as archived

### 3. Fix Frontend Build Issues
The frontend currently has Next.js 15 compatibility issues (see CLAUDE.md):
```bash
# Components need to be converted to Client Components for ssr: false
# See error details in apps/frontend/CLAUDE.md
```

### 4. Add Backend Dev Script
Update `apps/backend/package.json`:
```json
{
  "scripts": {
    "dev": "node app.js",
    "start": "node app.js"
  }
}
```

### 5. Environment Variables
- Backend: Copy `.env` from old repo → `apps/backend/.env`
- Frontend: Set up environment variables in Vercel or create `apps/frontend/.env.local`

### 6. Update CI/CD
If you have existing GitHub Actions or Vercel configs, update them for monorepo structure:
- Vercel: Point to `apps/frontend` directory
- Build commands should use workspace scripts

## 📋 Migration Notes

### Git History Preservation
- Backend history: `git-history-backend.patch` (1.6MB)
- Frontend history: `git-history-frontend.patch` (27MB)
- Full backup: `../radiorogue-backup-YYYYMMDD-HHMMSS.tar.gz`

### Old Directories
The `radiorogue-backend/` and `radiorogue-frontend/` directories are still present for reference. You can delete them after verifying the monorepo works:
```bash
rm -rf radiorogue-backend radiorogue-frontend
```

## 🔍 Verification Checklist

- [x] Backup created
- [x] Git history preserved
- [x] Monorepo structure created
- [x] npm workspaces configured
- [x] Dependencies installed
- [ ] Frontend build fixed (Next.js 15 compatibility)
- [ ] Backend dev script added
- [ ] Git repository pushed to GitHub
- [ ] Old repositories archived
- [ ] CI/CD updated

## 📚 Resources

- [npm workspaces docs](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- Frontend modernization plan: `apps/frontend/CLAUDE.md`

## 🐛 Known Issues

1. **Frontend Build Failing**: Next.js 15 breaking changes with `ssr: false` in Server Components
   - Files affected: `src/app/page.tsx`, `src/components/BlogDetail.tsx`
   - Solution: Convert to Client Components with `'use client'` directive

2. **Multiple Lockfiles Warning**: Resolved by removing duplicate lockfiles from workspace apps

## 👤 Author

Pavan Kommi

## 📄 License

ISC
