# Pitch Deck Platform - Technical Architecture

## Repository Structure

```
pitch-deck/
├── apps/
│   └── web/                          # Next.js 14 App Router application
│       ├── app/                      # App Router pages & API routes
│       │   ├── api/                  # Backend API endpoints (Node.js runtime)
│       │   │   ├── unlock/           # NDA acceptance & session creation
│       │   │   └── events/           # Analytics event tracking
│       │   ├── invite/[code]/        # Investor invite gate page
│       │   ├── deck/[id]/            # Fullscreen deck viewer
│       │   ├── summary/              # Post-deck summary page
│       │   ├── hub/                  # Resource hub with CTAs
│       │   └── w/                    # Product workspace (future multi-tenant)
│       ├── middleware.ts             # Edge runtime session validation
│       ├── prisma/
│       │   ├── schema.prisma         # Multi-tenant ready data model
│       │   └── seed.ts               # Demo data seeder
│       └── next.config.mjs           # Monorepo file tracing config
│
├── packages/@pd/                     # Scoped workspace packages
│   ├── ui/                           # React component library
│   ├── auth/                         # Authentication & session management
│   ├── analytics/                    # Event tracking utilities
│   ├── legal/                        # NDA & compliance helpers
│   ├── schemas/                      # Zod validation schemas
│   ├── templates/                    # Deck templates (future)
│   └── themes/                       # Visual themes (future)
│
├── netlify.toml                      # Netlify deployment config
├── pnpm-workspace.yaml               # Monorepo workspace definition
├── package.json                      # Root build orchestration
└── turbo.json                        # Turborepo task pipeline
```

---

## Frontend Architecture (UI/UX)

### Design System: **Agua Theme (Glass Morphism)**

**Visual Language:**
- **Glass morphism cards** with backdrop blur and semi-transparent backgrounds
- **Animated noise texture** background for depth and visual interest
- **CSS custom properties** for theme consistency across components
- **Responsive grid layouts** with Tailwind CSS utilities

**Color Palette (CSS Variables):**
```css
--color-bg: #0a0a0f       /* Deep blue-black background */
--color-fg: #e8e9ed       /* Light foreground text */
--color-accent: #4a9eff   /* Bright blue accent */
--color-glass: rgba(255, 255, 255, 0.05)  /* Glass card background */
```

---

### Component Library (`packages/@pd/ui`)

#### **Core Components**

1. **`GlassCard`**
   - Base container with glass morphism styling
   - Backdrop blur, border glow, shadow depth
   - Used across all page layouts

2. **`NdaModal`** (Client Component)
   - Checkbox-based NDA acceptance UI
   - Displays full legal text from `@pd/legal`
   - Client-side validation before submission
   - Location: `packages/@pd/ui/src/NdaModal.tsx`

3. **`KeyInput`** (Client Component)
   - Masked input for invite codes
   - Real-time format validation
   - Auto-submit on complete entry
   - Location: `packages/@pd/ui/src/KeyInput.tsx`

4. **`DeckViewer`** (Client Component)
   - **Fullscreen presentation mode** with automatic entry attempt
   - Keyboard navigation (arrow keys, spacebar)
   - Progress indicator with slide counter
   - Swipe gesture support (future)
   - Fires `onLastSlide` callback when reaching end
   - Location: `packages/@pd/ui/src/DeckViewer.tsx`

5. **`EndDeckModal`** (Client Component)
   - Appears after final slide
   - Two CTA buttons: "View Summary" | "Resource Hub"
   - Tracks CTA clicks via analytics
   - Location: `packages/@pd/ui/src/EndDeckModal.tsx`

6. **`HubGrid`**
   - Grid layout for resource links
   - Hover effects with scale transform
   - Icon + title + description cards
   - Location: `packages/@pd/ui/src/HubGrid.tsx`

7. **`Toast`** (Client Component)
   - Non-blocking notification system
   - Auto-dismiss with configurable timeout
   - Error/success/info variants
   - Location: `packages/@pd/ui/src/Toast.tsx`

---

### Page Flow (User Journey)

```
┌─────────────────────────────────────────────────────────────────┐
│  PUBLIC INVESTOR FLOW (No login required)                       │
└─────────────────────────────────────────────────────────────────┘

1. Landing Page (/)
   ↓ [Navigate to invite link]

2. Invite Gate (/invite/[code])
   - Display: KeyInput component for invite code entry
   - Validation: Check code exists in database (Invite table)
   - UI: Glass card with title, description, key input
   - File: apps/web/app/invite/[code]/page.tsx
   ↓ [Valid code entered]

3. NDA Modal (overlay on /invite/[code])
   - Display: Full legal text with checkbox
   - Component: NdaModal from @pd/ui
   - Validation: Checkbox must be checked
   - Action: POST /api/unlock with { code, accepted: true }
   ↓ [Accept NDA]

4. API: Session Creation (/api/unlock)
   - Runtime: Node.js (for Prisma & crypto)
   - Validates: Invite code + NDA acceptance
   - Constant-time key comparison (timing attack safe)
   - Creates: HMAC-signed session cookie (deck_session)
   - Logs: Event (nda_accepted) with hashed email
   - Returns: { deckId, redirect: `/deck/${deckId}` }
   - File: apps/web/app/api/unlock/route.ts
   ↓ [Redirect to deck]

5. Middleware Check (middleware.ts)
   - Runtime: Edge (for low latency)
   - Protected routes: /deck/*, /summary, /hub
   - Validates: deck_session cookie signature & expiration
   - Uses: Web Crypto API (Edge-compatible HMAC)
   - Redirect: If invalid → /invite/demo
   - File: apps/web/middleware.ts
   ↓ [Session valid]

6. Deck Viewer (/deck/[id])
   - Server: Fetches deck + slides from Prisma
   - Client: DeckViewerClient component with state
   - Display: Fullscreen presentation mode
   - Navigation: Keyboard arrows, spacebar
   - Markdown: Slides rendered with marked.js
   - Tracking: deck_start, slide_view, deck_end events
   - File: apps/web/app/deck/[id]/page.tsx
   ↓ [Reach last slide]

7. End Deck Modal (overlay on /deck/[id])
   - Component: EndDeckModal from @pd/ui
   - CTAs: "View Summary" | "Resource Hub"
   - Tracking: cta_click event with choice
   - Client: apps/web/app/deck/[id]/DeckViewerClient.tsx
   ↓ [Click CTA]

8a. Summary Page (/summary)
    - Display: Deck overview, key highlights
    - Session: Required (protected by middleware)
    - File: apps/web/app/summary/page.tsx

8b. Resource Hub (/hub)
    - Component: HubGrid with link cards
    - Links: Documentation, demo booking, contact
    - Session: Required (protected by middleware)
    - File: apps/web/app/hub/page.tsx
```

---

## Backend Architecture

### Runtime Split Strategy

**Edge Runtime** (middleware.ts)
- **Purpose:** Session validation before page render
- **Crypto:** Web Crypto API (HMAC-SHA256)
- **Imports:** `@pd/auth/src/edge.ts` (Edge-compatible helpers)
- **Restrictions:** No Node.js APIs, no Prisma
- **Latency:** <50ms globally

**Node.js Runtime** (API routes)
- **Purpose:** Database operations, heavy crypto
- **Directive:** `export const runtime = 'nodejs'` at top of file
- **Imports:** `@pd/auth/src/index.ts` (Node crypto module)
- **Features:** Prisma Client, constant-time comparison
- **Files:**
  - `apps/web/app/api/unlock/route.ts`
  - `apps/web/app/api/events/route.ts`

---

### Authentication System (`packages/@pd/auth`)

**Session Flow:**

1. **Sign Session** (Node.js)
   ```typescript
   // packages/@pd/auth/src/index.ts
   export function signSession(payload: SessionPayload, secret: string): string {
     const data = JSON.stringify(payload);
     const hmac = createHmac('sha256', secret);
     const signature = hmac.digest('hex');
     const encoded = Buffer.from(data).toString('base64');
     return `${encoded}.${signature}`;
   }
   ```

2. **Verify Session** (Edge)
   ```typescript
   // packages/@pd/auth/src/edge.ts
   export async function verifySession(
     signedData: string,
     secret: string
   ): Promise<SessionPayload | null> {
     // Web Crypto API implementation
     // Constant-time signature comparison
     // Expiration check
   }
   ```

**Session Payload:**
```typescript
{
  sessionId: string;    // CUID
  deckId: string;       // Which deck unlocked
  inviteCode: string;   // Original invite code
  exp: number;          // Unix timestamp (24 hours)
}
```

**Security Features:**
- **HMAC-SHA256** signatures prevent tampering
- **Constant-time comparison** prevents timing attacks
- **24-hour expiration** limits session lifespan
- **Base64URL encoding** for cookie safety
- **Email hashing (SHA-256)** in audit logs

---

### Data Layer (Prisma + PostgreSQL)

**Database Schema:**

```prisma
// Multi-tenant ready structure

model Workspace {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  ownerId   String
  projects  Project[]
  events    Event[]
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  name        String
  decks       Deck[]
}

model Deck {
  id         String         @id @default(cuid())
  projectId  String
  project    Project        @relation(fields: [projectId], references: [id])
  title      String
  visibility DeckVisibility @default(PRIVATE)
  slides     Slide[]
  invites    Invite[]
}

model Slide {
  id      String @id @default(cuid())
  deckId  String
  deck    Deck   @relation(fields: [deckId], references: [id])
  index   Int
  title   String
  content String @db.Text  // Markdown
  assets  Json?

  @@unique([deckId, index])
}

model Invite {
  id             String   @id @default(cuid())
  deckId         String
  deck           Deck     @relation(fields: [deckId], references: [id])
  code           String   @unique  // e.g., "demo"
  recipientEmail String?
  status         InviteStatus @default(ACTIVE)
  expiresAt      DateTime?
  createdAt      DateTime @default(now())
}

model Event {
  id        String   @id @default(cuid())
  name      String   // e.g., "nda_accepted", "deck_end"
  payload   Json?    // Event metadata
  sessionId String?
  deckId    String?
  createdAt DateTime @default(now())

  @@index([name, createdAt])
}
```

**Key Design Patterns:**

1. **Workspace Isolation**
   - All tenant data scoped to `workspaceId`
   - Ready for Row Level Security (RLS)
   - Future: User → Workspace memberships

2. **Invite System**
   - Each deck has unique invite codes
   - Optional expiration dates
   - Email tracking (hashed in logs)
   - Status: ACTIVE | USED | EXPIRED

3. **Event Tracking**
   - Schema-less JSON payload
   - Indexed by name + timestamp
   - Session correlation via sessionId
   - Anonymous by default (hashed PII)

---

### Analytics (`packages/@pd/analytics`)

**Client-Side Tracking:**

```typescript
// packages/@pd/analytics/src/index.ts
export async function trackEvent(
  name: string,
  payload?: Record<string, unknown>
): Promise<void> {
  await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, payload })
  });
}
```

**Tracked Events:**
- `nda_accepted` - User accepts legal terms
- `deck_start` - First slide view
- `slide_view` - Each slide navigation
- `deck_end` - Reached last slide
- `cta_click` - End modal CTA interaction

**Server-Side Logging:**
```typescript
// apps/web/app/api/events/route.ts
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { name, payload } = await request.json();
  const sessionCookie = request.cookies.get('deck_session')?.value;
  const sessionData = verifySession(sessionCookie, secret);

  await prisma.event.create({
    data: {
      name,
      payload: payload as Prisma.InputJsonValue,
      sessionId: sessionData?.sessionId || null,
      deckId: sessionData?.deckId || null,
    }
  });
}
```

---

## Deployment Architecture

### Netlify Configuration

**Build Pipeline:**
```toml
[build]
  command = "pnpm build"
  publish = "apps/web/.next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Deployment Flow:**
1. **Install:** `pnpm install` (frozen lockfile)
2. **Prebuild:** `pnpm --filter web db:generate` (Prisma Client)
3. **Build:** `pnpm --filter web build` (Next.js)
4. **Package:** @netlify/plugin-nextjs bundles OpenNext
5. **Deploy:** Edge middleware + serverless API routes

**Runtime Distribution:**
- **Static Pages:** `/`, `/summary`, `/hub` (pre-rendered)
- **Dynamic Pages:** `/invite/[code]`, `/deck/[id]` (SSR)
- **API Routes:** `/api/unlock`, `/api/events` (Node.js lambdas)
- **Middleware:** Session validation (Edge)

---

## Environment Variables

**Required:**
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Session Security (32+ char random string)
COOKIE_SECRET="your-secret-key-here"

# Feature Flags
ENABLE_SIGNUP="false"  # Single-user mode by default
```

**Development:**
```bash
# Local dev server
pnpm dev           # Runs Next.js dev at localhost:3000

# Database operations
pnpm db:push       # Push schema to DB
pnpm db:generate   # Generate Prisma Client
pnpm seed          # Seed demo data

# Testing
pnpm test          # Run Vitest tests
pnpm lint          # ESLint + Next.js checks
```

---

## Security Checklist

✅ **Implemented:**
- HMAC-signed session cookies (tamper-proof)
- Constant-time key comparison (timing attack prevention)
- SHA-256 email hashing in logs (PII protection)
- Edge middleware validation (pre-render security)
- 24-hour session expiration
- HTTPS-only cookies (secure flag)
- XSS prevention (React escaping + CSP ready)

🔜 **Planned:**
- Rate limiting on /api/unlock
- CAPTCHA on NDA acceptance
- IP-based session binding
- Audit log retention policies

---

## Monorepo Workflow

**Package Management (pnpm):**
```bash
# Install dependencies
pnpm install

# Add package to workspace
pnpm --filter web add <package>

# Run scripts in workspace
pnpm --filter web dev
pnpm --filter @pd/ui build

# Run all workspace builds
pnpm -r build
```

**Turborepo Caching:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": { "cache": false }
  }
}
```

---

## Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 14.2.10 | App Router, SSR, API routes |
| **Runtime** | Node.js | 18 | Server-side execution |
| **Package Manager** | pnpm | 9.12.3 | Workspace monorepo |
| **Build System** | Turborepo | 1.12.1 | Task orchestration |
| **Database** | PostgreSQL | Latest | Primary data store (Neon) |
| **ORM** | Prisma | 5.22.0 | Type-safe database client |
| **Auth** | Custom HMAC | - | Session management |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **Validation** | Zod | 3.22.4 | Runtime type checking |
| **Markdown** | marked | 11.1.1 | Slide content rendering |
| **Testing** | Vitest | 1.2.1 | Unit/integration tests |
| **Deployment** | Netlify | - | Edge + Serverless hosting |

---

## Key Architectural Decisions

1. **Monorepo Structure**
   - **Why:** Code sharing, atomic commits, unified versioning
   - **Trade-off:** More complex build setup vs single-repo simplicity

2. **Edge/Node Runtime Split**
   - **Why:** Low-latency validation + full Node.js features where needed
   - **Trade-off:** Dual crypto implementations vs unified codebase

3. **HMAC Sessions (No JWT)**
   - **Why:** Simpler crypto, no public key management, smaller cookies
   - **Trade-off:** Server-side secret required vs stateless JWT

4. **Invite-Based Access (No User Auth Yet)**
   - **Why:** MVP simplicity, focus on investor flow first
   - **Trade-off:** Limited user management vs full auth system

5. **PostgreSQL + Prisma**
   - **Why:** Type safety, migrations, multi-tenant ready
   - **Trade-off:** Learning curve vs raw SQL flexibility

6. **Component Library in Monorepo**
   - **Why:** UI consistency, reusable across future apps
   - **Trade-off:** More packages to manage vs inline components

---

## Future Roadmap (Not Implemented)

**Prompt 2:** Seed & Documentation
- Full pitch deck content (20+ slides)
- Professional copywriting
- Asset management (images, videos)

**Prompt 3:** Multi-Tenant SaaS
- User authentication (Clerk/Supabase)
- Workspace management UI
- Team collaboration features
- Billing integration (Stripe)

**Prompt 4:** Themes & Templates
- Visual theme switcher (Agua, Midnight, etc.)
- Pre-built deck templates
- Custom branding per workspace

**Prompt 5:** Assets & CDN
- Signed URL generation (Cloudinary/S3)
- Image optimization pipeline
- Video embedding

**Prompt 6:** Advanced Analytics
- Viewer heatmaps
- Time-on-slide tracking
- Geographic analytics
- Export to CSV/PDF

**Prompt 7:** Formal NDA
- DocuSign integration
- Legal agreement versioning
- Audit trail compliance

**Prompt 8:** Netlify Hardening
- DDoS protection rules
- Advanced caching strategies
- CDN optimization
- Performance monitoring

---

## Developer Quick Start

```bash
# 1. Clone repository
git clone https://github.com/diego9608/pitch-deck.git
cd pitch-deck

# 2. Install dependencies
corepack prepare pnpm@9.12.3 --activate
pnpm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and COOKIE_SECRET

# 4. Initialize database
pnpm db:push
pnpm seed

# 5. Start dev server
pnpm dev
# Open http://localhost:3000

# 6. Test invite flow
# Navigate to http://localhost:3000/invite/demo
# Accept NDA, view deck
```

---

## Contact & Resources

- **Repository:** https://github.com/diego9608/pitch-deck
- **Deployment:** https://pitch-deck.netlify.app (pending)
- **Documentation:** See `/docs` folder for detailed guides
- **Issues:** GitHub Issues for bug reports
- **Owner:** @diego9608
