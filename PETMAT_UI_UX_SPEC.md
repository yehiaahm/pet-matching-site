# PetMat UI/UX Specification

## PHASE 1 – Product Understanding
- **Core Problem**: Breeding matchmaking lacks trust, verified identity, and clarity. Pet owners struggle to find reputable breeders; breeders struggle to qualify matches efficiently. PetMat solves this by combining verified profiles, transparent criteria, and real-time matchmaking with clear safeguards.
- **Primary Flows**:
  1. **Discover → Trust → Signup**: Land → see trust signals → simple CTA → register.
  2. **Profile → Verification → Preferences**: Create profile → upload docs for breeder verification → set breeding preferences (species, breed, age, health, genetic tests).
  3. **Match → Review → Contact**: See curated matches → compare profiles transparently → initiate chat or schedule.
  4. **Schedule → Confirm → Follow-up**: Pick dates → exchange health/vet forms → finalize match → receive alerts.
  5. **Alerts → Actions**: Real-time notifications → quick action (view profile, message, schedule) without friction.
- **User Emotions by Step**:
  - Landing: curious, cautious → show credibility immediately.
  - Registration: hopeful, wary → reduce friction, explain privacy.
  - Verification (breeders): anxious about approval → provide progress, ETA.
  - Matching: excited → provide clarity, comparisons, and ethical guidance.
  - Scheduling: decisive → keep steps simple, confirm with receipts.
  - Notifications: responsive → ensure quick context and non-intrusive toasts.

## PHASE 2 – Design System (MANDATORY)
- **Color Palette** (mapped to existing CSS variables in theme.css; replace suggested values):
  - Primary: `--primary: #0F766E` (teal 600) → trustworthy, veterinary-like.
  - Primary-foreground: `--primary-foreground: #FFFFFF` for contrast.
  - Secondary: `--secondary: #F59E0B` (amber 500) → highlights, CTAs.
  - Secondary-foreground: `--secondary-foreground: #0F172A` (slate 900).
  - Neutral: background `#FFFFFF`, text `#111827` (gray 900), borders `#E5E7EB`.
  - Success: `--chart-4: #22C55E` (green 500) and/or add `--success: #22C55E`.
  - Error: `--destructive: #EF4444` (red 500), `--destructive-foreground: #FFFFFF`.
  - Info: add `--info: #3B82F6` (blue 500) for banners/toasts.
  - Muted/Accent: `--muted: #F3F4F6`, `--accent: #E5E7EB` for panels.
  - WHY: Teal projects medical trust; amber energizes actions without aggression; neutral grays maintain premium clarity.
- **Typography**
  - Font: Inter (system fallback), readable for Arabic and Latin; size base 16px.
  - Hierarchy:
    - H1: 32px/40, H2: 24px/32, H3: 20px/28, H4: 18px/26.
    - Body-L: 16px/24, Body-S: 14px/22, Caption: 12px/18.
  - WHY: Larger headings improve scanning; body at 16 preserves accessibility.
- **Spacing System**
  - 8pt rule: 4/8/12/16/24/32/48/64. Use 16 for default padding; 24–32 for section gaps.
  - WHY: Predictable rhythm reduces cognitive load for non-technical users.
- **Radius, Shadows, Elevation**
  - Radius: Inputs 8px, Buttons 10px, Cards 12px, Pills 999px.
  - Shadows:
    - Level 1: subtle `0 1px 2px rgba(16,24,40,0.05)`.
    - Level 2: `0 2px 8px rgba(16,24,40,0.08)`.
    - Level 3: `0 8px 24px rgba(16,24,40,0.12)` (modals).
  - WHY: Soft elevation communicates hierarchy without visual noise.
- **Icons & Imagery**
  - Icons: `lucide-react` outlined icons; 16/20/24 sizes with consistent stroke.
  - Imagery: clean pet portraits, neutral backgrounds; breeder badges and verification seals.
  - WHY: Outline icons pair with premium minimalism; imagery builds emotional trust.
- **Accessibility**
  - Contrast: ≥ 4.5:1 for text on backgrounds.
  - Text: min 14px for labels; focus-visible rings at 2px (`--ring` color) with offset.
  - Language: RTL support for Arabic; mirror layout with logical order; select Arabic locale auto-sets `dir="rtl"`.
  - WHY: Trust and inclusivity directly correlate with usability.

## PHASE 3 – Layout & Structure
- **Grid**
  - Desktop: 12-column, 1200px max; gutters 24px.
  - Tablet: 8-column, 768–1024px; gutters 16px.
  - Mobile: 4-column, 360–640px; gutters 12px.
  - WHY: A stable grid provides predictable scanning across breakpoints.
- **Header & Navigation**
  - Sticky header with compact mode on scroll; primary nav: Home, Match, Dashboard, Notifications, Profile.
  - Secondary actions: Login/Register (unauth) or Avatar Menu (auth). Language toggle EN/AR.
  - WHY: Persistent access to core flows boosts engagement and clarity.
- **Footer**
  - Columns: Trust & Safety, Help, Legal, Contact, Social; partners/verification badges; small print.
  - WHY: Reinforces credibility and provides help at decision moments.

## PHASE 4 – Page-by-Page UI Design
- **1) Landing Page**
  - Purpose: Build trust, explain value, drive signup.
  - Layout: Hero (headline + trust badges + CTA) → How It Works (3 steps) → Real Matches preview → Verified Breeders section → Testimonials → FAQ → Footer.
  - Components: HeroBanner, TrustBadges, StepCards, MatchCarousel, TestimonialCards, CTAButton.
  - User Actions: CTA to Register, Explore Matches (guest view), Switch Language.
  - Empty: If no matches, show sample cards with “Connect to see local matches.”
  - Error: Network banner with retry.
  - Success: Snackbar/toast on newsletter/signup.
- **2) Login / Register**
  - Purpose: Fast, clear auth; explain data use.
  - Layout: Split panel (benefits left, form right). Register tabbed: Owner vs Breeder.
  - Components: AuthTabs, TextInput, PasswordStrength, TermsCheckbox, SocialLogin (optional), ProgressBar for breeder verification.
  - Actions: Login, Register, Forgot Password.
  - Empty: Show tips: “Verified breeders see more matches.”
  - Error: Inline validation, summary alert with field anchors.
  - Success: Redirect to Dashboard with welcome toast.
- **3) User Dashboard**
  - Purpose: Snapshot of matches and actions.
  - Layout: Overview cards (Matches, Messages, Verification status) → Recommended matches list → Upcoming schedules → Alerts panel.
  - Components: StatCards, MatchListItem, ScheduleList, AlertsFeed, QuickActions.
  - Actions: View match, message, schedule, complete verification.
  - Empty: “No recommended matches yet” + refine preferences.
  - Error: Fallback blocks with retry, offline notices.
  - Success: Inline confirmation when preferences saved.
- **4) Matching Page**
  - Purpose: Filter, compare, and connect.
  - Layout: Filters sidebar (species, breed, age, health, genetics, distance) → Results grid → Compare drawer → Profile modal.
  - Components: FilterChips, RangeSlider, ToggleGroup, MatchCard, CompareDrawer, ProfileModal.
  - Actions: Save filter preset, open profile, request contact, schedule.
  - Empty: Friendly illustration + “Adjust filters to widen results.”
  - Error: Graceful degradation; partial results with banner.
  - Success: Toast “Request sent to breeder” with link to chat.
- **5) Notifications Center**
  - Purpose: Organize real-time alerts.
  - Layout: Tabs (All, Matches, Messages, System) → List with read states → Detail panel.
  - Components: NotificationItem, Tabs, MarkAllRead, TimeGrouping.
  - Actions: Open item, mark read/unread, filter.
  - Empty: “You’re all caught up.”
  - Error: Retry control; show last synced time.
  - Success: Toast on bulk actions.
- **6) Profile & Verification Page**
  - Purpose: Build trust; collect docs.
  - Layout: Profile header (avatar, badges) → Sections: About, Pets, Health & Genetics, Certificates, Reviews → Verification wizard (for breeders).
  - Components: AvatarUploader, BadgeGroup, DocUploader with status, Stepper, ReviewList.
  - Actions: Save, submit verification, edit sections.
  - Empty: “Add your first certificate” with guided tooltip.
  - Error: Upload errors inline; status persists.
  - Success: Status chip “Pending Review” → “Verified” with timeline.

## PHASE 5 – Micro-Interactions & Motion
- **Hover**: Buttons elevate to Shadow-2; cards slightly scale (1.01) and shadow-2.
- **Button Feedback**: Pressed state darkens color by ~8%; disabled at 60% opacity.
- **Loading**: Spinners for instant actions; skeletons for lists/cards (2–3 shimmer lines).
- **Skeletons**: Cards 16px radius, 3 rows; list items 2 rows + avatar circle.
- **Real-time Notifications**: Toasts slide from top-right, auto-dismiss in 4–6s, accessible pause on hover, “view” CTA. Use in-app banners for critical alerts.
- **Animation Rules**: Duration 150–250ms, easing `cubic-bezier(0.22, 1, 0.36, 1)` for in; `cubic-bezier(0.4, 0, 0.2, 1)` for out. Respect `prefers-reduced-motion`.
- **WHY**: Subtle motion improves feedback without distracting from trust.

## PHASE 6 – Mobile & Responsive
- **Mobile-first**: Single-column, sticky bottom action bar on matching page; touch targets ≥ 44px.
- **Tablet**: 2-column results with collapsible filters; modals become side drawers.
- **Desktop**: 3–4 column grids; persistent filters; hover affordances.
- **WHY**: Each breakpoint emphasizes core tasks while preserving clarity.

## PHASE 7 – Implementation Guidance
- **Component Structure (React)**
  - `components/ui`: `Button`, `Input`, `Select`, `Card`, `Chip`, `Tabs`, `Toast`, `Skeleton`, `Stepper`, `Badge`, `AvatarUploader`, `DocUploader`.
  - `components/layout`: `Header`, `Footer`, `Sidebar`, `PageSection`.
  - `components/match`: `FilterPanel`, `MatchCard`, `CompareDrawer`, `ProfileModal`.
  - `components/notifications`: `NotificationsList`, `NotificationItem`, `MarkAllRead`.
  - WHY: Encapsulation and reuse maintain performance and consistency.
- **Reusable Patterns**
  - Form controls follow consistent spacing and validation feedback; error text under inputs, inline icons.
  - Cards use standard header/body/footer slots; actions right-aligned.
  - Skeleton components match final layout dimensions.
- **Performance Decisions**
  - Code-splitting for `ProfileModal` and `CompareDrawer` via dynamic imports.
  - Virtualize long lists (matches, notifications) with windowing.
  - Memoize heavy cards; debounce filter changes; cache results.
  - Socket events: batch UI updates; reconcile unread counts smoothly.
- **Token Mapping to theme.css**
  - Update `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--accent`, `--destructive`, and consider adding `--success`, `--info`.
  - Prefer Tailwind utilities that map to `@theme inline` variables already defined.

## Why These Decisions
- Every choice optimizes for trust-first clarity, predictable interaction, and real-time responsiveness. The palette and motion are deliberately calm but engaging; structure and spacing ensure non-technical users never feel lost.
