# Pitch Deck Platform

Production-grade monorepo for secure investor pitch deck presentation with multi-tenant architecture. Currently running in single-user mode, designed to scale to 1,000+ users without core rewrites.

## 🎯 Features

### Public Investor Flow
- **Secure Gate**: SHA-256 key validation with constant-time comparison
- **NDA Clickwrap**: Required acceptance before deck access
- **HMAC Sessions**: Cookie-signed 24-hour sessions
- **Fullscreen Deck**: Immersive presentation experience
- **End-of-Deck CTAs**: Modal with links to Executive Summary and Hub
- **Event Tracking**: Privacy-focused analytics

### Private Product Flow (Scaffolded)
- **Multi-tenant Ready**: Workspace-based data model with RLS support
- **Projects & Decks**: Hierarchical organization
- **Templates**: Reusable deck and document templates
- **Themes**: CSS variable-based theming system
- **Auth Ready**: Prepared for Clerk or Supabase Auth

## 🏗️ Architecture

### Monorepo Structure
```
pitch-deck/
├── apps/
│   ├── web/              # Next.js 14 app (App Router)
│   └── worker/           # Future: PDF export, thumbnails
├── packages/
│   └── @pd/
│       ├── ui/           # React components
│       ├── auth/         # HMAC, crypto utilities
│       ├── analytics/    # Event logging
│       ├── legal/        # NDA management
│       ├── templates/    # Deck templates
│       ├── themes/       # Theme tokens
│       └── schemas/      # Zod + Prisma types
├── docs/                 # Markdown documents
└── infra/               # Deployment configs
```

### Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript strict)
- **Styling**: Tailwind + CSS Variables
- **Database**: Prisma + PostgreSQL (Supabase recommended)
- **Monorepo**: pnpm workspaces + Turborepo
- **Testing**: Vitest + Testing Library
- **CI/CD**: GitHub Actions + Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database (or Supabase account)

### Installation

1. Clone and install dependencies:
```bash
cd pitch-deck
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example apps/web/.env.local
```

3. Generate your gate hash:
```bash
# On macOS/Linux:
echo -n "YOUR_SECRET_KEY" | shasum -a 256

# On Windows (PowerShell):
# Use an online SHA-256 generator or install shasum
```

4. Generate cookie secret:
```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows: use an online generator or install OpenSSL
```

5. Update `apps/web/.env.local` with your values:
```env
DECK_GATE_HASH=<your_sha256_hash>
COOKIE_SECRET=<your_random_string>
DATABASE_URL=<your_postgres_url>
ENABLE_SIGNUP=false
DEFAULT_WORKSPACE_SLUG=agua
DEFAULT_PROJECT_SLUG=maquila-agua
```

6. Initialize database:
```bash
pnpm db:push
pnpm seed
```

7. Start development server:
```bash
pnpm dev
```

Visit `http://localhost:3000/invite/demo` and use your secret key to access the deck.

## 📋 Commands

### Development
```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm test         # Run all tests
```

### Database
```bash
pnpm db:push      # Push schema to database
pnpm seed         # Seed initial data
```

## 🔒 Security Features

### Investor Gate
- **Constant-time comparison**: Prevents timing attacks
- **SHA-256 hashing**: Never store plain keys
- **HMAC cookies**: Tamper-proof sessions
- **IP & UA logging**: Audit trail for NDA acceptance

### Content Protection
- Deck not rendered in HTML before unlock
- Middleware validates all protected routes
- Session expiration after 24 hours
- Future: Signed URLs for assets

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

Test coverage includes:
- `constantTimeEquals` timing-safe comparison
- `signSession` / `verifySession` HMAC operations
- Session tampering detection
- Expiration handling

Example test output:
```
✓ packages/@pd/auth/src/index.test.ts (15)
  ✓ constantTimeEquals (5)
  ✓ signSession (3)
  ✓ verifySession (6)
  ✓ sha256 (3)
  ✓ hashEmail (3)
```

## 📦 Data Model

### Key Entities
- **User**: Platform users (future)
- **Workspace**: Tenant boundary (RLS-ready)
- **Project**: Container for decks and resources
- **Deck**: Presentation with slides
- **Invite**: Access codes with gate hashes
- **DeckSession**: Visitor sessions with NDA consent
- **Event**: Analytics tracking

All tenant-bound tables include `workspaceId` for future RLS enforcement.

## 🎨 Theming

The **agua** theme is the default:
- Deep blue background (`#0a1628`)
- Subtle animated noise
- Glass morphism cards
- Accessible focus indicators
- Reduced motion support

Customize via CSS variables in `apps/web/app/globals.css` or create new themes in `@pd/themes`.

## 🚢 Deployment

### Netlify

1. Connect your repo to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy configuration:
```toml
[build]
  command = "pnpm build"
  publish = "apps/web/.next"

[[edge_functions]]
  path = "/deck/*"
  function = "middleware"
```

4. Push to main branch to deploy

### Environment Variables (Production)
Ensure these are set in Netlify:
- `DECK_GATE_HASH`
- `COOKIE_SECRET`
- `DATABASE_URL`
- `ENABLE_SIGNUP=false`

## 📚 Routes

### Public Investor Routes (Protected)
- `/invite/[code]` - Gate with NDA clickwrap
- `/deck/[id]` - Fullscreen deck viewer
- `/summary` - Executive summary
- `/hub` - Resource center

### Private Product Routes (Future)
- `/w/[workspace]/dashboard` - Workspace overview
- `/w/[workspace]/p/[project]/deck` - Deck editor

## 🔮 Future Enhancements

See follow-up prompts in the master specification:
1. **Prompt 2**: Seed & Docs
2. **Prompt 3**: Multi-tenant scaffolding
3. **Prompt 4**: Themes & Templates
4. **Prompt 5**: Assets & Signed URLs
5. **Prompt 6**: Analytics & Exports
6. **Prompt 7**: Formal NDA (DocuSign)
7. **Prompt 8**: Netlify hardening

## 🤝 Contributing

This is a single-owner project for now. Contributions will be accepted once multi-tenant features are enabled.

## 📄 License

Private - All Rights Reserved

## 🆘 Support

For issues or questions:
- Check the `/docs` folder for detailed specifications
- Review test files for usage examples
- Consult the master prompt for architectural decisions

---

**Built with Claude Code** 🤖
