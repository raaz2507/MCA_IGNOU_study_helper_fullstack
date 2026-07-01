# GyanPath UI Audit

Audit date: 2026-07-01  
Scope: all UI-bearing Eta/HTML templates, CSS, browser-rendering JavaScript, shared modules, images/icons, route wiring, and representative desktop/mobile rendering. Application code and assets were not changed.

## Executive summary

GyanPath is a server-rendered Express/Eta study portal with progressively enhanced, JavaScript-heavy resource, reader, question-bank, discussion/chat, and administration experiences. Its strongest visual idea is a calm, approachable learning workspace: cool blue surfaces, rounded cards, soft depth, generous public-page whitespace, and several reading themes. The public shell is coherent and friendly; specialized tools are useful but increasingly look like separate products.

The repository already has a meaningful token foundation in `base.css` (colors, typography, spacing, radii, sizing and four themes). The largest design-system risk is that this foundation is only partially adopted. `index.css` is a 5,436-line catch-all containing public, account, dashboard, admin, resource, lecture and contributor styles. Across all CSS there are roughly 445 literal color occurrences, 248 radius declarations and 95 shadow declarations. Repeated literals and page-specific component variants make visual behavior difficult to predict.

Highest priorities: split and document the CSS architecture; consolidate buttons/fields/cards/statuses into shared primitives; replace literal visual values with semantic tokens; standardize focus, disabled, loading, error and empty states; and test keyboard/mobile behavior on the resource catalog, question bank and admin tables.

## Repository UI map and methodology

- 24 page templates under `frontend/views/pages`, one shared layout and seven partials.
- 13 CSS files: `base.css`, `index.css`, `app-paper.css`, reader/gallery styles, breadcrumb, legacy `style.css`, and page styles.
- 18 UI component/utility modules and 22 page modules; several admin panels exist primarily as JS-rendered markup.
- Public rendering was inspected at the local application URL. Protected screens that redirected to login were reviewed from their templates, CSS and rendering modules. No authenticated mutations were performed.
- Screenshots were visually inspected where rendering was available. This document uses concise visual descriptions instead of committing screenshot binaries.

## Existing design philosophy (inferred)

1. **Calm study environment.** Pale blue-gray gradients, white/translucent cards and low-saturation borders reduce visual stress.
2. **Content first.** Resources are grouped by semester/type; readers and question detail views maximize working space.
3. **Friendly rather than institutional.** Rounded panels, emoji symbols, bright accents and conversational copy counterbalance dense academic content.
4. **Progressive enhancement.** Eta provides shell/content while modules add cards, filters, themes, dialogs, authentication and live data.
5. **Role-aware workspaces.** Public pages use a top navigation; management screens use dashboards, sidebars, toolbars and tables.
6. **Themeable reading.** Light, dark, sepia and pink palettes are first-class tokens, with PDF filtering and per-page preferences.

## Page inventory and visual descriptions

| Route/template | Rendered or source-observed UI |
|---|---|
| `/` (`home.eta`) | Shared header/footer; two-column hero with large calm-message copy and a rounded account panel containing Login/Sign Up/Forgot tabs. Strong whitespace and clear primary CTA. |
| `/resources` (`resources.eta`) | The densest public page: breadcrumb, announcements/banner carousel, sticky/sidebar navigation, semester panels, theory/practical groups and large resource-card grids. Rendered page contained hundreds of links; scanability depends heavily on grouping and color. |
| `/about` | Stacked information cards, mission/features/trust content, feedback form and contributor cards. Visually aligned with shared public shell. |
| `/user-guide` | Long-form numbered guide inside an `info-card`; conventional reading layout with shared shell. |
| `/editor-guide`, `/admin-guide` | Role-specific long-form operational guides. Unauthenticated rendering redirects to login; source uses the same information-page idiom. |
| `/video-lectures` | Heading, search/language toolbar and JS-rendered lecture cards with media metadata and empty state. Public-shell styling is consistent. |
| `/paper-gallery` | Standalone library header, summary/search toolbar and large responsive PDF-card grid with preview image, tags, metadata and primary action. Does not use the full shared footer/header. |
| `/pdf-viewer` | Standalone compact viewer header, language and theme segmented controls, fullscreen/download actions, iframe and explicit not-found state. Efficient tool-like layout. |
| `/question-bank` | Distinct app shell: dark left sidebar, topbar, filters, list/detail split workspace, paper-like answer content, history/related sections and progress stats. Highly functional but visually separate from public GyanPath. |
| `/login` | Centered login card in shared shell, username/password fields, password reveal and messaging. Clear but duplicated conceptually by the home account panel. |
| `/profile` | Two stacked cards for profile and password forms. Protected; includes disabled identity/role fields and live messages. |
| `/access-denied` | Minimal standalone status card with two recovery links; lacks the full shared shell and richer contextual help. |
| `/dashboard` | Role-aware dashboard cards and shortcuts. Protected; source reveals a management-oriented card grid, account/action clusters and testing entry points. |
| `/dashboard/study-materials` | Shared dashboard shell plus JS-rendered resource management: filters/toolbars, tables/cards, upload/edit modal and feedback states. |
| `/dashboard/question-papers` | Parallel management workspace for papers; structurally similar but not fully expressed through a shared declarative component. |
| `/dashboard/academic-operations` | Banner, contributor, lecture and operational management panels rendered by admin modules. Many locally styled controls/status chips. |
| `/admin` | Admin overview plus dynamic banner, contributor, link-preview, lecture and content tools. Protected; very high interaction density. |
| `/admin/users` | Search/filter/role controls and management table with action menus/statuses. Horizontal overflow is the primary mobile strategy. |
| `/admin/database` | Provider/status cards, audit output, operations and destructive-action affordances. Needs especially strong state and severity consistency. |
| `/testing` | Two large feature cards linking to Discussion and Chat, plus an explanatory note. Uses colorful gradients and emoji icons. |
| `/discussion` | Community feed with search/filter tabs, post cards, avatars, subject/status chips, side-room activity and moderation checklist. Responsive two-column-to-stack behavior. |
| `/chat` | Three-pane messaging layout (navigation/conversations/thread), message bubbles, compose tools and participant/status UI. Collapses progressively on narrow screens. |
| Legacy paper HTML (`assets/resources/.../exam_papers`) | Multiple self-contained exam-paper documents styled by `style.css`; floating controls and paper surfaces do not share the modern shell. |
| Root `index.html` | Legacy/entry artifact; route wiring redirects canonical use to the Eta application. |

## Foundations

### Color

Core light tokens use blue `#2563eb`, navy sidebar `#07172e`→`#102747`, text `#1f2937`, heading `#0f172a`, muted `#64748b`, white surfaces and blue-gray borders. Semantic tokens exist for success (`#16a34a`), danger (`#dc2626`) and warning (`#ea580c`). Dark, sepia and pink theme overrides are defined in `base.css`.

Usage is inconsistent beyond the core: semester and feature accents introduce violet, cyan, teal, orange, pink and gold literals. Discussion/testing files define their own palettes. White/black overlays and red/green/blue status colors frequently bypass semantic aliases. This risks theme contrast failures and makes “accent,” “info,” “selected,” and “link” visually ambiguous.

### Typography

- Body/UI: Inter with Segoe UI, Roboto and Arial fallbacks.
- Headings: Poppins fallbacks.
- Reading content: Merriweather/Georgia serif.
- Code: Roboto Mono/Cascadia Code/Consolas.
- Type is mostly `rem`, with responsive `clamp()` on important headings. Dense admin metadata often falls to `.68–.8rem`; a few 9–12px values are too small for sustained use.
- Font weights frequently use 700/800, producing strong hierarchy but sometimes making toolbars and cards uniformly loud.

### Spacing

`--space-1` through `--space-8` form a clean 4px scale (4–32px), supplemented by layout tokens. Adoption is partial: many components hardcode 9, 10, 11, 14, 15, 18, 22, 26 and 30px. Public pages generally breathe; dashboards/resources frequently compress labels, buttons and metadata into visually busy groups.

### Border radius

Tokens define 8, 10, 14, 18 and 20px plus a 999px badge radius. Actual CSS contains about 248 declarations, including frequent literals at 9, 11, 12, 14, 16, 18, 20 and 24px. The rounded philosophy is consistent, but the scale is not. Circular icon/avatar controls appropriately use 50%.

### Shadows

The base shadow is `0 12px 32px rgba(15,23,42,.12)`. Cards use many variations from subtle 8px/22px depth to 24px/70px modals; tilt cards add stronger shadows and text/drop shadows. Elevation lacks named levels, so identical roles can appear at different depths. Dark/sepia theme shadow tokens help, but literal shadows often escape them.

### Icons and assets

- Brand assets include favicon sizes, touch icon and raster site logo; social preview and QR assets are present.
- Functional icons are a mix of Unicode arrows, emoji, text glyphs (`•••`, `☾`, `★`, `✓`), CSS-drawn password eyes and image/SVG assets.
- Resource/question SVGs are content illustrations, not a reusable icon set.
- Emoji are fast and friendly but render differently across OSes, have inconsistent baseline/weight, and can create noisy accessible names unless hidden.
- Several buttons correctly use `aria-label`; decorative glyph handling is inconsistent. Establish one SVG icon component/library with size/stroke tokens.

## Layout patterns

- **Public shell:** shared header/nav, optional breadcrumb, centered main content, share/donation footer and toast region.
- **Information page:** centered `info-page` containing one or more rounded `info-card`s.
- **Catalog:** sidebar/sticky navigation plus grouped card grids and collapsible blocks.
- **Management:** fixed/dark sidebar, topbar, filters/toolbar, cards/tables and modal forms.
- **Master-detail:** question-bank and chat use fixed navigation/list/detail columns.
- **Standalone tools:** paper gallery, PDF viewer and access-denied intentionally omit parts of the shared shell.
- Container widths include `--content-width: 1100px`, management width calculations, 220/280px sidebars and a 410px list column. These are useful but not consistently consumed.

## Component inventory

### Reusable modules already present

- Site shell, header, footer, sidebar and breadcrumb
- Modal and toast utilities
- Banner carousel
- Subject, resource/paper and question cards
- Contributor card/list
- Card tilt behavior
- Standalone page helper
- Theme and page-preference utilities
- Auth/protected-page helpers

### Recurring visual components

Buttons (primary, secondary, ghost, danger, icon, pill, link), text/select/search fields, tabs/segmented controls, cards/panels, status/subject/language badges, avatars, progress bars, tables, toolbars, dialogs, empty/error/loading messages, media previews, breadcrumbs, side navigation, pagination/action menus and toasts.

### Missing reusable abstractions

- A single Button/IconButton API with size, tone and state variants
- Shared Field, Select, SearchField, HelpText and validation message
- Shared Card/Panel and SectionHeading primitives
- Shared Badge/StatusChip mapped to semantic tones
- Standard Toolbar/FilterBar and responsive action overflow
- DataTable shell with empty/loading/error/mobile behavior
- StatePanel for loading/error/empty/permission/not-found
- Skeleton/spinner/progress indicators
- Confirm/destructive dialog patterns
- Unified auth/account form (home and login duplicate behavior/presentation)
- Unified media/resource card contract; server partials and JS renderers duplicate markup
- Unified app-shell variants instead of bespoke question-bank/chat/dashboard shells

## Responsive behavior

Media queries cluster around 600, 640, 650, 700, 760/768, 800, 900, 960 and 1200px. Public columns stack, card grids reduce columns, navigation becomes compact, dialog padding contracts, and discussion/chat side content moves or hides. The viewer reorganizes controls below 960px and again below 600px. Admin tables primarily preserve a large minimum width and scroll horizontally.

Risks:

- Breakpoints are numerous and un-tokenized, causing near-identical but mismatched transitions.
- The resource page's very high link/card count creates long mobile scrolling and weak “where am I?” orientation.
- Question-bank fixed sidebar/list dimensions can leave limited detail width at tablet sizes.
- Three-pane chat requires careful focus preservation when panes hide/collapse.
- Horizontal admin tables keep data intact but hide actions/context and are difficult for touch and zoom users.
- Hover/tilt effects must be gated for coarse pointers and `prefers-reduced-motion`.

## Accessibility audit

### Existing strengths

- Semantic landmarks, headings and navigation labels are common.
- Many forms have labels/help text and live message regions.
- Dialogs and tool regions often have accessible labels.
- Images generally have alt text; decorative preview images use empty alt where appropriate.
- Theme controls, password reveal buttons and not-found/empty states show accessibility intent.

### Issues and risks

1. No consistent global `:focus-visible` contract across all buttons, links, tabs, cards and bespoke controls.
2. Emoji/glyph icons may be announced unexpectedly; some icon-only actions rely only on visible symbols.
3. Color-coded semester/status/difficulty states are not always reinforced consistently by text/icon.
4. Small metadata text (sometimes 9–11px) is difficult at zoom and on mobile.
5. Custom tab/segmented navigation needs verified arrow-key, Home/End and focus behavior; ARIA alone is insufficient.
6. Dynamic grids/lists use live regions, but loading and result-count announcements are inconsistent.
7. Disabled controls can have low contrast; disabled styling/semantics vary.
8. Modal focus trap, initial focus, return focus and Escape behavior should be centrally verified.
9. Card tilt, carousel and other transitions lack a clearly comprehensive reduced-motion strategy.
10. Very dense resource link groups and admin tables need skip links/section navigation and stronger heading associations.
11. Question-bank sidebar buttons should expose current state semantically (`aria-current`/pressed) and maintain mobile focus.
12. PDF iframe availability and keyboard/browser-reader limitations need a text fallback and direct-download explanation.
13. Pink/sepia/dark themes require automated contrast checks because literal colors do not inherit token corrections.
14. Feedback/rating controls and generated admin form markup need label/name/error association auditing after render.

## Inconsistencies and technical design debt

### Duplicated CSS

- `index.css` combines unrelated domains and repeats card, field, toolbar, modal, badge and responsive patterns.
- `pages/home.css` and `pages/question-bank.css` are one-line imports, obscuring ownership rather than isolating page CSS.
- Chat/discussion/testing independently redefine familiar panel, avatar, badge, toolbar and breakpoint patterns.
- `pdf-gallery.css`, `pdf-viewer.css`, `app-paper.css` and legacy `style.css` repeat surfaces, controls and shadows with parallel naming.
- Multiple forms of “info card,” “login card,” “side card,” “management card,” “panel,” and “resource card” share visual DNA without shared primitives.

### Hardcoded values

- Approximate static counts: 445 literal color usages, 248 radius declarations, 95 shadow declarations and 21 media-query blocks across CSS.
- `index.css` alone contains about 181 literal colors, 150 radius declarations and 65 shadows.
- Repeated literal white, navy, blue, danger red, teal/violet accents and RGBA overlays bypass themes.
- One-off widths, minimum table widths, fixed sidebars, tiny font sizes, z-indexes and transition timings need scales.
- Inline width appears in the discussion health meter; dynamic inline styles may exist in JS-rendered progress/media content.

### Missing design tokens

- Semantic color roles: info, selected, focus, disabled, overlay, link, visited, inverse, neutral status
- Accent ramps and on-accent text colors
- Elevation levels (`shadow-1`…`shadow-modal`)
- Complete radius aliases by component role
- Typography scale/line-height/weight tokens
- Breakpoint/container tokens (or documented CSS custom media/build equivalent)
- Motion duration/easing and reduced-motion policy
- z-index layers
- Control heights and icon sizes
- Opacity/disabled/read-only tokens
- Data visualization/status palettes with contrast guarantees

## State coverage

| State | Current coverage | Gap |
|---|---|---|
| Hover | Common on cards/buttons/links | Touch-safe and theme-consistent behavior is uneven. |
| Active/selected | Tabs, pills, navigation and question selection exist | Semantics and visual treatment vary. |
| Focus | Some inputs use rings | All interactive components need consistent `:focus-visible`. |
| Disabled/read-only | Present in profile/admin/actions | Tone, cursor, contrast and reason/help are inconsistent. |
| Loading | JS often begins with “Loading…” or empty containers | No shared skeleton/spinner; layout shift and announcements vary. |
| Error | Login/messages, viewer not-found and API toasts exist | Field-level errors and retry actions are not standardized. |
| Empty | Resource, lecture, discussion, gallery and viewer states exist | Copy, iconography, CTA and panel styling are fragmented. |
| Success | Toasts/messages/status chips exist | Success confirmation duration and persistence vary. |
| Permission | Redirect/login/access-denied exist | In-context explanation and recovery path could be richer. |
| Offline/stale | Not visibly standardized | Important for PDFs, cached previews, chat and remote lecture media. |

## Recommended priority list

### P0 — accessibility and reliability

1. Define and apply global keyboard focus, reduced-motion and minimum target-size rules.
2. Audit contrast in all four themes, including every literal-colored status/badge/control.
3. Standardize modal keyboard behavior and dynamic loading/error announcements.
4. Fix sub-12px essential text and verify zoom/reflow at 200–400%.

### P1 — establish the system

5. Document semantic tokens and replace repeated literal colors/radii/shadows incrementally.
6. Extract Button, Field, Badge, Card, StatePanel, Toolbar and DataTable primitives.
7. Split `index.css` by foundation/component/layout/page ownership; remove import-only page shims.
8. Adopt a single icon system while keeping emoji only as deliberate decorative/content choices.
9. Consolidate server partial and client renderer contracts for resource, paper, contributor and lecture cards.

### P2 — unify product surfaces

10. Define public, reader and management shell variants with shared navigation/theme/state behavior.
11. Reconcile question-bank, chat and admin spacing/type/control styles with the core system.
12. Consolidate home/login account UI and validation behavior.
13. Replace admin-table mobile overflow with responsive priorities, cards or an explicit detail drawer where appropriate.

### P3 — polish and governance

14. Create a component gallery showing all themes, breakpoints and states.
15. Add visual regression snapshots for representative public, reader and admin pages.
16. Add linting/checks for forbidden literal colors, missing focus styles and inaccessible icon buttons.
17. Define content/design guidelines for empty, error, permission, offline and destructive states.

## Suggested success criteria

- Every interactive component is keyboard reachable, visibly focused and usable at 200% zoom.
- Every shared component demonstrates hover, focus, active, disabled, loading, error and empty states where relevant.
- All theme-sensitive colors resolve through semantic tokens and meet WCAG contrast targets.
- No page-specific CSS reimplements a system button, field, badge, card, dialog or table shell.
- Representative pages pass desktop (1280px), tablet (~768px) and mobile (~390px) visual regression checks.
- CSS ownership is obvious from file location; the catch-all stylesheet no longer carries unrelated page domains.
