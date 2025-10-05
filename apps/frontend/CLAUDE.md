# Radiorogue Frontend Modernization Plan

Generated: 2025-09-04

## Git Workflow Conventions (MANDATORY)

### Branch Naming Convention
Branches MUST follow the format: `<type>/<YYYYMMDD>-<project>-<short-description>`

**Components:**
- **type**: feature/, fix/, chore/, hotfix/
- **YYYYMMDD**: Date the branch is created
- **project**: Repository slug (radiorogue, kommut, mrcool)
- **short-description**: Kebab-case summary of the change

**Examples:**
- `chore/20250904-radiorogue-dependency-modernization`
- `feature/20250910-radiorogue-user-auth`
- `fix/20250912-radiorogue-navigation-bug`
- `hotfix/20250915-radiorogue-vercel-deploy`

### Tag Naming Convention
Use semantic versioning: `v<major>.<minor>.<patch>`

**Special checkpoints:**
- Pre-modernization: `v0.9.0-pre-modernization`
- Release candidates: `v1.0.0-rc.1`
- Beta releases: `v1.0.0-beta.1`

### Commit Message Convention
Use Conventional Commits format: `<type>(<scope>): <message>`

**Examples:**
- `chore(radiorogue): upgrade dependencies to latest stable versions`
- `feat(radiorogue): add dark mode support`
- `fix(radiorogue): resolve mobile navigation issue`

**Types:**
- **feat**: New feature
- **fix**: Bug fix
- **chore**: Maintenance tasks
- **docs**: Documentation changes
- **style**: Code formatting
- **refactor**: Code restructuring
- **perf**: Performance improvements
- **test**: Testing updates
- **ci**: CI/CD changes

### Current Working Branch
- **Branch**: `chore/20250904-radiorogue-dependency-modernization`
- **Rationale**: Modernizing dependencies after one year of no updates
- **Base Tag**: `v1.0.0-pre-modernization` (rollback checkpoint before upgrades)
- **Target Tag**: `v1.1.0` (after successful modernization)

### Branch History
| Branch | Created | Purpose | Status |
|--------|---------|---------|--------|
| chore/20250903-radiorogue-upgrade | 2025-09-03 | Initial upgrade attempt | Renamed |
| chore/20250904-radiorogue-dependency-modernization | 2025-09-04 | Comprehensive dependency modernization | Active |

## Executive Summary

This document outlines a comprehensive upgrade plan for the Radiorogue frontend application after one year of no updates. The project uses Next.js 14, React 18, and Tailwind CSS 3, with several dependencies requiring updates for security, performance, and feature improvements.

## Current Dependency Analysis

### Core Dependencies Status
| Package | Current | Latest | Recommendation | Risk Level |
|---------|---------|--------|----------------|------------|
| next | 14.2.32 | 15.5.2 | Upgrade to 15.x | Medium |
| react | 18.3.1 | 19.1.1 | Stay on 18.3.1 | Low |
| react-dom | 18.3.1 | 19.1.1 | Stay on 18.3.1 | Low |
| tailwindcss | 3.4.17 | 4.1.12 | Stay on 3.x (stable) | Low |
| eslint | 8.57.1 | 9.34.0 | Stay on 8.x | Low |
| typescript | 5.x | 5.7.2 | Upgrade to 5.7.2 | Low |
| @types/node | 20.19.12 | 24.3.0 | Upgrade to 22.x (LTS) | Low |

### Other Dependencies
All other dependencies (@heroicons/react, @vercel/analytics, cheerio, date-fns, etc.) are relatively up-to-date and don't require immediate attention.

## Upgrade Strategy

### Phase 1: Conservative Updates ✅ COMPLETED (2025-09-04)
Focus on patch and minor updates that don't introduce breaking changes.

**Completed Actions:**
- ✅ Upgraded TypeScript from 5.x to 5.9.2
- ✅ Upgraded @types/node from 20.19.12 to 22.18.0
- ✅ Verified lint and build pass successfully
- ✅ Created phase1-report.md with detailed results

**Results:**
- No breaking changes encountered
- Build and lint pass without errors
- TypeScript compilation successful

### Phase 2: Major Framework Update (PENDING)
Upgrade Next.js to version 15, which includes performance improvements and new features.

### Phase 3: Future Considerations
React 19 and Tailwind CSS 4 upgrades should be considered after they've been battle-tested in production for several months.

## Step-by-Step Upgrade Plan

### Step 1: Backup and Branch Creation
```bash
git checkout -b chore/20250904-radiorogue-dependency-modernization
git status
```

### Step 2: Update TypeScript and Type Definitions
```bash
npm install --save-dev typescript@^5.7.2
npm install --save-dev @types/node@^22.10.7
```

**Commit message:** `chore(radiorogue): upgrade TypeScript to 5.7.2 and Node types to v22 LTS`

### Step 3: Update Minor Dependencies
```bash
npm update
```

**Commit message:** `chore(radiorogue): update all minor and patch dependencies`

### Step 4: Upgrade Next.js to Version 15

#### 4.1 Pre-upgrade Preparation
```bash
# Run tests and build to ensure everything works
npm run lint
npm run build
```

#### 4.2 Automated Upgrade
```bash
npx @next/codemod@canary upgrade latest
```

This command will:
- Update Next.js, React, and React-DOM to compatible versions
- Apply necessary codemods for breaking changes
- Update eslint-config-next

#### 4.3 Manual Updates Required

**Update next.config.mjs for Next.js 15:**
```javascript
// next.config.mjs
const config = {
    // Add experimental features if needed
    experimental: {
        // Enable if using React 19 features
        // reactCompiler: true,
    },
    
    async rewrites() {
        return [
            {
                source: '/robots.txt',
                destination: '/api/robots.txt',
            },
            {
                source: '/sitemap',
                destination: '/api/sitemap',
            },
            {
                source: '/news-sitemap',
                destination: '/api/news-sitemap',
            },
            {
                source: '/general-sitemap',
                destination: '/api/general-sitemap',
            },
            {
                source: '/sitemaps/:page',
                destination: '/api/sitemaps/:page',
            },
        ];
    },
};

export default config;
```

#### 4.4 Apply Async Request API Codemod
```bash
npx @next/codemod@canary next-async-request-api .
```

This will convert any synchronous usage of `cookies()`, `headers()`, and `params` to async.

**Commit message:** `chore(radiorogue): upgrade Next.js to 15.x with breaking changes migration`

### Step 5: Verify and Test
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run linting
npm run lint

# Run development server
npm run dev

# Build for production
npm run build

# Test production build
npm run start
```

### Step 6: Performance Optimizations

#### Update Image Optimization Configuration
Review and update any `next/image` usage to leverage Next.js 15's improved image optimization.

#### Font Loading Optimization
Ensure fonts are loaded optimally using Next.js 15's font optimization features.

**Commit message:** `chore(radiorogue): optimize performance with Next.js 15 defaults`

## Breaking Changes to Address

### Next.js 15 Breaking Changes

1. **Async Request APIs**
   - `cookies()`, `headers()`, and `params` are now async
   - Use the provided codemod to automatically update

2. **Caching Changes**
   - GET Route Handlers no longer cached by default
   - Client Router Cache changes for Page components
   - Review and adjust caching strategies as needed

3. **React 19 RC in App Router**
   - Next.js 15 uses React 19 RC for App Router
   - Pages Router maintains React 18 compatibility

### TypeScript Configuration
No changes required - current configuration is compatible.

### Tailwind CSS
No breaking changes - staying on v3 for stability.

## Migration Commands Summary

```bash
# Step 1: Create branch
git checkout -b chore/20250904-radiorogue-dependency-modernization

# Step 2: Update TypeScript and types
npm install --save-dev typescript@^5.7.2 @types/node@^22.10.7
git add -A && git commit -m "chore(radiorogue): upgrade TypeScript to 5.7.2 and Node types to v22 LTS"

# Step 3: Update minor dependencies
npm update
git add -A && git commit -m "chore(radiorogue): update all minor and patch dependencies"

# Step 4: Upgrade Next.js
npx @next/codemod@canary upgrade latest
npx @next/codemod@canary next-async-request-api .
git add -A && git commit -m "chore(radiorogue): upgrade Next.js to 15.x with breaking changes migration"

# Step 5: Clean install and test
rm -rf node_modules package-lock.json
npm install
npm run lint
npm run build
git add -A && git commit -m "chore(radiorogue): update package-lock.json for dependency upgrades"

# Step 6: Performance optimizations (if any)
# Make any necessary code changes
git add -A && git commit -m "chore(radiorogue): optimize performance with Next.js 15 defaults"
```

## Post-Upgrade Checklist

- [ ] All dependencies updated successfully
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without issues
- [ ] Production build (`npm run start`) works correctly
- [ ] SEO features intact (sitemap, robots.txt, metadata)
- [ ] ISR (Incremental Static Regeneration) working
- [ ] Image optimization functional
- [ ] Font loading optimized
- [ ] No console errors in development or production
- [ ] Performance metrics maintained or improved

## Future Recommendations

### 6-Month Review (Q3 2025)
- Consider React 19 upgrade if stable and widely adopted
- Evaluate Tailwind CSS 4 for production readiness
- Review ESLint 9 migration (requires flat config migration)

### Security Updates
- Set up automated dependency updates with Dependabot or Renovate
- Implement regular security audits with `npm audit`
- Consider using `npm audit fix` for automatic security patches

### Performance Monitoring
- Implement Vercel Analytics (already installed)
- Monitor Core Web Vitals after upgrade
- Set up performance budgets

## References

### Official Documentation Used
1. [Next.js 15 Release Blog](https://nextjs.org/blog/next-15)
2. [Next.js Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
3. [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
4. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
5. [ESLint Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
6. [TypeScript Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html)

### Tools and Commands
- Next.js Codemod: `@next/codemod@canary`
- npm outdated: For checking dependency status
- npm audit: For security vulnerability checking

## Notes

- The project structure is clean and follows Next.js best practices
- No `.env` files were found, suggesting environment variables are managed externally (likely Vercel)
- The sitemap configuration is custom-implemented via API routes
- The project uses TypeScript with strict mode enabled
- Tailwind Typography plugin is configured with custom styles

## Support

For any issues during the upgrade process:
1. Check the official Next.js upgrade guide
2. Review the GitHub issues for each package
3. Test thoroughly in a development environment before deploying
4. Consider creating a staging environment for testing major upgrades