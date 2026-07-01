# GyanPath Design-System Implementation Plan

Status: planning only  
Source of truth: `docs/UI_AUDIT.md` and the existing GyanPath project identity  
Constraint: preserve the current UI; refactor before redesigning

## 1. Design goals

1. Preserve GyanPath's calm, approachable blue study-portal identity.
2. Make existing public, reader, question-bank and management surfaces feel related without forcing them into one identical layout.
3. Reduce CSS duplication and literal values while keeping rendered output stable during migration.
4. Give every recurring control a predictable visual, responsive and accessible contract.
5. Keep academic content primary and controls visually quieter than the material they support.
6. Retain progressive enhancement: server-rendered Eta content must remain useful before page JavaScript finishes.
7. Support the existing light, dark, sepia and pink reading themes through semantic tokens.
8. Prefer CSS-only refactoring. Change JavaScript or templates only when a component contract, semantic state or accessibility behavior cannot be achieved safely in CSS.
9. Improve maintainability without importing the conventions or appearance of Tailwind, Bootstrap, Material Design, shadcn or another external design system.
10. Make migrations reversible, reviewable and small enough for visual comparison.

### Non-goals

- No new brand, layout language or visual trend.
- No wholesale markup rewrite.
- No replacement of working business logic.
- No forced unification of genuinely different public, reader and management workflows.
- No conversion to a CSS framework or utility-class architecture.
- No speculative redesign of protected pages that has not been visually reviewed.

## 2. Existing visual identity to preserve

- Cool blue primary actions and navigation, navy management/sidebar surfaces, blue-gray borders and pale blue-gray page backgrounds.
- White or translucent cards with gentle borders, soft depth and rounded corners.
- Generous public-page whitespace and calmer information hierarchy.
- Poppins headings, Inter-style UI/body text, Merriweather-style reading content and monospaced code.
- Friendly copy, occasional deliberate emoji, semester/type accents and conversational empty/error messages.
- The public header/footer shell, resource grouping by semester and theory/practical type, and content-first reader layouts.
- The compact utility of the PDF viewer and the paper-like question answer surface.
- Role-aware management layouts and dark sidebars, while reducing their visual divergence from the core system.
- Light, dark, sepia and pink themes, including their current reading purpose.
- Existing logo, favicon, QR, contributor and academic content assets.

Any change that noticeably alters brand blue, page density, card silhouette, type personality or navigation placement is **Needs manual review**.

## 3. Token strategy

Tokens should have three layers:

1. **Primitive tokens** describe raw values, such as a blue ramp or 4px spacing step.
2. **Semantic tokens** describe intent, such as `--color-action-primary` or `--color-text-muted`.
3. **Component tokens** provide narrow overrides, such as `--button-height-md`, and should usually reference semantic tokens.

Existing public custom-property names must remain as compatibility aliases until all consumers migrate. Do not perform a one-shot rename.

### Colors

Keep the current values as the initial palette. Add semantic names before replacing literals.

```css
/* Representative naming plan; final values begin with existing values. */
--color-bg-page;
--color-bg-page-gradient;
--color-surface;
--color-surface-muted;
--color-surface-raised;
--color-surface-translucent;
--color-border;
--color-border-strong;
--color-text;
--color-text-heading;
--color-text-muted;
--color-text-inverse;
--color-link;
--color-link-hover;
--color-action-primary;
--color-action-primary-hover;
--color-action-on-primary;
--color-focus-ring;
--color-selection;
--color-overlay;
--color-disabled-bg;
--color-disabled-text;
--color-status-neutral;
--color-status-info;
--color-status-success;
--color-status-warning;
--color-status-danger;
--color-on-status-*;
--color-sidebar-start;
--color-sidebar-end;
--color-paper;
```

Rules:

- Preserve `#2563eb` as the initial light-theme primary and the existing navy sidebar values.
- Map current `--app-*`, `--surface`, `--accent`, `--blue`, and similar aliases to one semantic layer; remove aliases only after usage reaches zero.
- Theme overrides should change semantic tokens, not component selectors.
- Semester, theory, practical, discussion and testing accents may remain contextual, but must be exposed as scoped semantic variables with tested on-accent text.
- Replace literal white/black overlays with surface, inverse-text or overlay tokens.
- Status colors must never be the only state indicator.
- Every changed foreground/background pair must be contrast-tested in all four themes.
- Exact visited-link behavior is **Needs manual review**, because it may affect dense resource catalogs.

### Typography

Preserve the four current font families. Introduce a type scale rather than changing typography visually.

```css
--font-family-ui;
--font-family-heading;
--font-family-reading;
--font-family-code;

--font-size-xs: 0.75rem;
--font-size-sm: 0.8125rem;
--font-size-md: 0.875rem;
--font-size-body: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: clamp(...);

--line-height-tight;
--line-height-ui;
--line-height-body;
--line-height-reading;
--font-weight-regular;
--font-weight-medium;
--font-weight-semibold;
--font-weight-bold;
```

- Eliminate essential 9–11px text; the default minimum for meaningful UI copy should be 12px/`0.75rem`, preferably 13px or larger.
- Keep compact admin metadata visually secondary without making it illegible.
- Do not globally normalize heading sizes until every page has been visually compared.
- External font loading behavior and availability are **Needs manual review**.

### Spacing

Keep the existing 4px scale (`--space-1` through `--space-8`) and extend it only when repeated layout evidence requires it.

- Component padding/gaps must reference the scale.
- Preserve current values initially by mapping common 10/14/18/26/30px literals to the closest existing or intentionally added token; do not round values if it causes visual drift.
- Add semantic layout aliases: `--gutter-page`, `--gap-layout`, `--padding-panel`, `--padding-panel-compact`, `--gap-control`, `--gap-toolbar`.
- Do not use spacing tokens for dimensions that communicate meaning, such as progress percentage or media aspect ratio.

### Radius

Retain the current rounded character.

```css
--radius-control: 10px;
--radius-card: 14px;
--radius-panel: 20px;
--radius-dialog: 18px;
--radius-pill: 999px;
--radius-circle: 50%;
```

Existing primitive 8/10/14/18/20px tokens remain. Consolidate 9/11/12/16/24px literals only after visual comparison. Resource feature cards or banners whose silhouette is intentionally distinctive may keep a scoped radius token.

### Shadows

Create named elevation roles using current shadow values:

```css
--shadow-none;
--shadow-control;
--shadow-card;
--shadow-card-hover;
--shadow-panel;
--shadow-popover;
--shadow-dialog;
--shadow-focus;
```

- Normal cards should use `card`; sticky/floating tools use `panel` or `popover`; modal surfaces use `dialog`.
- Theme-specific shadow color flows through tokens.
- Tilt-card and media-preview depth may remain specialized but must use scoped variables and reduced-motion rules.

### Z-index

Define a small documented stack:

```css
--z-base: 0;
--z-raised: 10;
--z-sticky: 100;
--z-dropdown: 300;
--z-overlay: 500;
--z-dialog: 600;
--z-toast: 700;
--z-tooltip: 800;
```

Do not mechanically replace a z-index until its containing/stacking context is inspected. PDF fullscreen, native `<dialog>`, sticky resource navigation and chat overlays are **Needs manual review**.

### Motion

```css
--duration-instant: 0ms;
--duration-fast: 120ms;
--duration-normal: 180ms;
--duration-slow: 300ms;
--ease-standard: cubic-bezier(...);
--ease-emphasized: cubic-bezier(...);
```

- Use motion to explain hover, selection, opening and dismissal—not as decoration around reading content.
- Restrict transitions to explicit properties; never use `transition: all`.
- Transform/tilt effects only apply when hover is available and the pointer is fine.
- Under `prefers-reduced-motion: reduce`, remove tilt/parallax, stop nonessential carousel animation, remove smooth scrolling and shorten transitions to effectively immediate.
- Carousel autoplay behavior is **Needs manual review**.

### Breakpoints

CSS custom properties cannot be used directly in standard media-query conditions. Maintain a documented canonical set and use literal values only at query declarations:

| Name | Width | Purpose |
|---|---:|---|
| compact | 600px | Small phones and compact viewer controls |
| mobile | 700px | Public navigation/forms/cards stack |
| tablet | 800px | Side content and dense toolbars reorganize |
| workspace | 960px | Master-detail and reader controls adapt |
| wide | 1200px | Large dashboard/catalog layout adjustments |

- Migrate current 640/650/760/768/900 queries only when equivalent behavior is verified.
- Prefer container-aware grid behavior (`minmax`, `auto-fit`) where it preserves current output.
- Do not collapse chat, question-bank or admin-table layouts differently without manual testing. Those are **Needs manual review**.

## 4. CSS architecture plan

### Load order

1. `base.css`: tokens, themes, reset and universal accessibility defaults.
2. Layout CSS: shared application shell/layout structures.
3. Component CSS: reusable visual primitives.
4. Page CSS: route-specific composition and exceptions.
5. Temporary compatibility CSS: old selectors during migration, removed when no longer referenced.

Avoid broad import graphs and circular `@import`s. Prefer explicit stylesheet entries in route configuration once files are stable.

### What stays in `base.css`

- Primitive, semantic and compatibility tokens
- Theme overrides for light/dark/sepia/pink
- Box sizing and minimal reset/normalization
- Body defaults, base text and heading defaults
- Visually hidden utility
- Global `:focus-visible` foundation
- Reduced-motion baseline
- Selection styling
- Basic media defaults (`img`, `svg`, `iframe` sizing behavior)
- Small accessibility utilities such as `.sr-only`

`base.css` must not contain route selectors, card variants, admin tables, resource layouts or modal implementations.

### What moves out of `index.css`

Move blocks without rewriting them first. Preserve selector order and behavior during extraction.

- Header, navigation, footer, site shell and sidebar → layout files
- Buttons, fields, tabs, badges, cards, toolbars, tables, dialogs, toast and state messages → component files
- Home/account hero → `pages/landing.css` or `pages/home.css`
- About, guides, profile, login and access-denied → dedicated or grouped information/account page files
- Resources, semester groups, subject/resource cards, banners → `pages/resources.css` plus component files
- Dashboard/admin/management sections → management layout and page files
- Video lecture catalog/editor → lecture component and page files
- Contributor display/editor → contributor component and admin page files
- Link-preview, banner and operations tooling → relevant admin page files

Do not delete a block from `index.css` until every route consuming it explicitly loads its destination stylesheet.

### Proposed component CSS files

Under `frontend/assets/css/components/`:

- `button.css`
- `field.css`
- `card.css`
- `badge.css`
- `toolbar.css`
- `data-table.css`
- `state-panel.css`
- `dialog.css`
- `toast.css`
- `tabs.css`
- `breadcrumb.css` (move existing file after compatibility check)
- `progress.css`
- `avatar.css`
- `media-card.css`
- `resource-card.css`
- `contributor-card.css`

Icon sizing can live in `button.css` initially; create `icon.css` only if non-button icon patterns justify it.

### Proposed layout CSS files

Under `frontend/assets/css/layouts/`:

- `public-shell.css`
- `management-shell.css`
- `reader-shell.css`
- `master-detail.css`
- `content-page.css`

### Proposed page CSS files

Under `frontend/assets/css/pages/`:

- `home.css` (replace its import-only role)
- `resources.css`
- `about.css`
- `guide.css` (user/editor/admin guides if visually equivalent)
- `account.css` (login/profile/access-denied only where safely shared)
- `video-lectures.css`
- `paper-gallery.css` (eventual move from root CSS path)
- `pdf-viewer.css` (eventual move from root CSS path)
- `question-bank.css` (replace import-only role)
- `dashboard.css`
- `admin.css`
- `admin-users.css`
- `admin-database.css`
- `testing.css`
- `discussion.css`
- `chat.css`

Keep `app-paper.css` and legacy `style.css` isolated initially. Their integration is risky and should be documented before changes.

## 5. Component standardization plan

Component classes should use a GyanPath-owned prefix such as `.gp-*` for new contracts. Existing classes remain compatibility selectors during migration. Do not rename every template at once.

### Button

- Base: `.gp-button`.
- Tones: primary, secondary, ghost, danger, link.
- Sizes: small, medium, large; medium is default.
- States: hover, active, focus-visible, disabled, loading.
- Minimum medium target: 44×44px where space allows; compact table actions may use 36px only with adequate row target and manual review.
- Loading preserves width, sets `aria-busy="true"` and prevents duplicate activation. Whether text is replaced or accompanied by an indicator is **Needs manual review**.
- Anchors styled as buttons remain links semantically; do not add disabled anchors without a real interaction contract.

### IconButton

- `.gp-icon-button`, using the same tones and focus treatment as Button.
- Square target, consistent icon sizes, no visible text required.
- Must have an accessible name (`aria-label` or labelled content).
- Decorative icon uses `aria-hidden="true"`.
- Do not standardize the icon artwork itself until an SVG set is approved: **Needs manual review**.

### Field

- A structural field contains label, control, optional help and error text.
- Shared height, padding, border, radius, disabled/read-only and focus tokens.
- Invalid state uses `aria-invalid="true"` and `aria-describedby` pointing to the error.
- Never rely on placeholder as label.
- Preserve native input behavior and autocomplete attributes.

### Select

- Uses the Field contract and native `<select>` by default.
- Standardize arrow spacing without hiding native semantics.
- Custom select/listbox behavior is out of scope unless a proven requirement exists; otherwise **Needs manual review**.

### SearchField

- Field variant with `type="search"`, a persistent accessible label, optional decorative search icon and an accessible clear action when present.
- Debounced/result behavior remains page logic.
- Result count should update through a scoped polite live region, not the entire results grid.

### Card

- `.gp-card` with surface, border, radius and padding variants.
- Variants: standard, muted, interactive, selected, media and compact.
- Interactive cards must contain or be a real link/button; do not make a generic `div` clickable.
- Hover elevation only for interactive cards and fine pointers.
- Semester/resource accent remains a scoped custom property rather than a separate card implementation.

### Badge

- Compact metadata label: subject, language, count or category.
- Neutral by default; semantic/contextual tones allowed.
- Not interactive unless rendered as a button/link with full control states.
- Must not encode critical status by color alone.

### StatusChip

- Reserved for state: pending, active, success, warning, danger, disabled, reported, solved, offline or stale.
- Maps state names to semantic status tokens and includes text plus optional hidden/decorative icon.
- Domain names must map consistently across public and admin surfaces.
- Final mapping of moderation/database states is **Needs manual review**.

### Toolbar

- Flex/grid container for title/context, filters and actions.
- Zones: start, filters, actions; wrapping order must remain logical in the DOM.
- Responsive wrapping must not reorder keyboard focus.
- Primary action remains identifiable; secondary actions may move into overflow only after behavior review.
- Provide an accessible label when multiple toolbars exist.

### DataTable

- Semantic `<table>` retained for tabular data with caption or labelled region.
- Standard header, row, cell, action, selected, hover and status styling.
- Support loading, empty and error rows via StatePanel-compatible content.
- Sort buttons expose `aria-sort`; row action menus follow menu-button conventions only if they are true menus.
- Keep horizontal scrolling as the safe initial behavior. Card conversion, column hiding and detail drawers are **Needs manual review**.

### StatePanel

- Shared presentation for loading, empty, error, not-found, permission, offline and stale states.
- Structure: optional icon, title, explanation, optional primary/secondary recovery actions.
- Error and permission variants must explain the next safe action.
- Loading uses `aria-busy` on the owning region and concise status text; skeletons are decorative.
- Avoid placing every StatePanel in an assertive live region.

### Modal/Dialog

- Prefer native `<dialog>` where existing browser support and current implementation permit it.
- Shared overlay, panel, title, body, footer and close-button styling.
- Required behavior: labelled title, optional description, initial focus, contained Tab navigation, Escape close where safe, return focus and background isolation.
- Destructive confirmation states use explicit action wording and danger tone.
- Converting existing custom modals or changing focus logic is **Needs manual review** and is not a CSS-only task.

### Toast

- One shared toast region and visual contract.
- Tones: neutral/info, success, warning, error.
- Routine updates use polite status semantics; urgent failures may use alert semantics.
- Do not auto-dismiss messages that require action or contain critical error detail.
- Pause dismissal on hover/focus where timed dismissal exists.
- Exact durations and stacking behavior are **Needs manual review**.

## 6. Accessibility plan

### Focus-visible

- Define a high-contrast, theme-aware focus ring using outline plus offset; do not remove native focus without replacement.
- Apply to links, buttons, form controls, tabs, cards with interactive descendants, menu triggers and custom controls.
- Ensure focus remains visible inside overflow containers and sticky headers.
- Verify against light, dark, sepia, pink, primary-blue and navy backgrounds.

### Reduced motion

- Add a global `prefers-reduced-motion: reduce` baseline.
- Disable card tilt/parallax, nonessential transform movement and smooth scrolling.
- Reduce carousel and modal transitions to immediate state changes.
- Do not hide loading progress or state feedback when animation is removed.

### Minimum touch targets

- Target 44×44px for primary controls, icon buttons, navigation and mobile actions.
- Maintain at least 8px separation between adjacent compact controls where feasible.
- Badges remain noninteractive unless they meet control requirements.
- Admin table exceptions require manual review and an equivalent enlarged row/action hit area.

### Contrast

- WCAG AA target: 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries/icons.
- Test all four themes and contextual accent surfaces.
- Disabled text must remain understandable even if exempt from strict contrast requirements.
- Never use opacity alone when it makes text unreadable.
- Add automated checks later, but retain manual review for gradients, images, translucent cards and PDF filtering.

### Keyboard navigation

- Preserve logical DOM order when layouts visually rearrange.
- Tabs: arrow keys, Home/End, selected state and roving focus where appropriate.
- Dialogs: focus entry, containment, Escape and return.
- Menus: only use menu keyboard patterns for actual action menus, not ordinary navigation lists.
- Master-detail pages must preserve focus when mobile panes change.
- Provide skip links/section navigation for the resource catalog and dense management pages.
- Chat, question-bank mobile focus behavior and admin action menus are **Needs manual review**.

### ARIA conventions

- Prefer native HTML before ARIA.
- Every page has one meaningful `h1`; headings do not skip levels solely for styling.
- Use `aria-current="page"` for navigation and appropriate current/pressed semantics for view toggles.
- Use `aria-expanded` plus `aria-controls` for collapsible sections.
- Icon-only controls require accessible names; decorative glyphs/SVGs are hidden.
- Validation connects label, help and error through IDs and `aria-describedby`.
- Dynamic regions announce concise changes, not large re-rendered containers.
- `aria-busy` belongs on the region being updated.
- Do not add redundant roles to native elements.

## 7. Migration phases

Each phase requires before/after screenshots at representative 1280px, ~768px and ~390px widths for affected public pages. Protected-page changes require an authenticated visual review before merging.

### Phase 0 — baseline and safeguards (no visual change)

- Record route-to-stylesheet ownership.
- Capture representative visual baselines for home, resources, about, paper gallery, PDF viewer and question bank.
- Capture protected dashboard/admin baselines with authorized test access. If unavailable: **Needs manual review**.
- Inventory selector usage across Eta and JS-rendered markup.
- Document current theme screenshots and keyboard paths.
- Add no-op compatibility aliases for planned token names.

### Phase 1 — safe first changes

- Add semantic token aliases pointing to existing values.
- Add motion, z-index, focus and component-dimension token definitions without changing consumers.
- Add global reduced-motion and focus-visible rules only after side-by-side verification.
- Extract exact CSS blocks from `index.css` into files while preserving selectors, declarations and load order.
- Move existing breadcrumb CSS into the component directory with its public URL preserved or route references updated atomically.
- Replace repeated literals with tokens only when computed output is identical.
- Establish documentation for Button, Field, Card, Badge and StatePanel contracts.

### Phase 2 — low-to-medium-risk standardization

- Apply compatibility selectors so existing button/field/card classes consume shared component rules.
- Consolidate login/profile/about/guide card and field styling.
- Consolidate public resource, lecture and contributor cards without changing generated data or event hooks.
- Standardize badge/status visual mappings.
- Standardize empty/error/loading presentation around existing markup.
- Normalize page stylesheet ownership and remove import-only shims.
- Validate all themes after each component family.

### Phase 3 — medium-risk markup adoption

- Add `.gp-*` classes to Eta templates incrementally while retaining old classes temporarily.
- Align JS-rendered markup with the same class contracts; do not alter API calls, data mapping or event behavior.
- Consolidate toolbar and DataTable styling across dashboard/admin pages.
- Standardize dialog and toast markup only where existing behavior already satisfies the contract.
- Add concise live status/result-count regions where missing.

### Phase 4 — medium-to-high-risk responsive work

- Consolidate breakpoints one page family at a time.
- Improve resource-page orientation and toolbar wrapping without changing content hierarchy.
- Verify viewer and public navigation at zoom/reflow widths.
- Preserve horizontal table scrolling initially; prototype alternatives separately.
- Make hover/tilt pointer-aware and test motion preferences.

### Risky changes to document only

Do not implement these without explicit approval, authenticated visual baselines and task-specific testing:

- Rebuilding question-bank or chat master-detail shells
- Converting admin tables to cards, hiding columns or adding detail drawers
- Consolidating home and login authentication behavior/markup
- Replacing emoji/glyphs with a new icon artwork set
- Rewriting modal focus management or changing native/custom dialog strategy
- Changing carousel autoplay or announcement behavior
- Integrating legacy exam-paper CSS into the modern shell
- Changing PDF viewer iframe/fullscreen/download behavior
- Renaming/removing all legacy selectors in one pass
- Changing public navigation information architecture
- Altering theme palettes, brand blue, fonts or card silhouette

Every item above is **Needs manual review**.

## 8. Implementation rules for AI agents

1. Read `docs/UI_AUDIT.md` and this plan before UI work.
2. Preserve rendered appearance unless the task explicitly authorizes a visible change.
3. Do not invent a new UI or import/copy patterns from Tailwind, Bootstrap, Material Design, shadcn or other design systems.
4. Use GyanPath's existing colors, typography, rounded surfaces, soft depth and content hierarchy as the source of truth.
5. Prefer CSS refactoring. Do not change business logic, API contracts, authentication, persistence or data flow for styling work.
6. Before moving CSS, identify every consuming Eta template and JS-rendered class with repository search.
7. Move declarations exactly first; normalize tokens and selectors in a later, separately reviewable step.
8. Preserve stylesheet order and specificity. Do not use `!important` to mask migration mistakes.
9. Never delete a legacy selector until repository search shows no server-rendered or JS-rendered consumer.
10. New reusable component classes use the agreed `.gp-*` namespace; existing classes remain compatibility hooks during migration.
11. Do not rename IDs, `data-*` attributes, form names, ARIA references or classes used by JavaScript without proving and updating every dependency.
12. Avoid inline styles. Dynamic values such as progress may set a narrowly scoped custom property when necessary.
13. Replace literal values only with semantically correct tokens, not merely numerically similar ones.
14. Test light, dark, sepia and pink themes for every shared-component change.
15. Verify hover, active, focus-visible, disabled, loading, error and empty states relevant to the changed component.
16. Verify keyboard operation and accessible names; prefer native HTML semantics.
17. Respect `prefers-reduced-motion` and coarse-pointer environments.
18. Check 1280px, ~768px and ~390px layouts; include 200% zoom/reflow for high-density changes.
19. Protected/admin UI must not be declared visually verified if authentication prevented rendering. Mark it **Needs manual review**.
20. Do not alter legacy paper, PDF, chat, question-bank or table behavior under a CSS-cleanup task.
21. Keep commits/patches scoped to one token layer, component family or page family where possible.
22. Report exact files moved, compatibility selectors retained, routes inspected and unresolved manual-review items.
23. If computed appearance, stacking, focus behavior, generated markup or component ownership is unclear, stop the risky part and write **Needs manual review** rather than guessing.

## Definition of done for each implementation slice

- The intended routes render without missing styles or layout shifts.
- No unrelated page changes visually.
- All old consumers remain styled or are deliberately migrated.
- Keyboard focus is visible and logical.
- Relevant states and four themes are checked.
- Responsive checks pass at desktop, tablet and mobile widths.
- No new unexplained literal color, radius, shadow, z-index or motion value is introduced.
- No business logic or API behavior changes.
- Any unverified protected or behavior-sensitive surface is explicitly marked **Needs manual review**.
