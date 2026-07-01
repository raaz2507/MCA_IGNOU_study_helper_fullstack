# GyanPath Design System

Official design-system source of truth  
Status: documents the current design language; it does not authorize a redesign  
Last verified: 2026-07-01

This document governs future GyanPath UI work. When it conflicts with an incidental existing style, preserve working behavior, follow this document for new work, and migrate the inconsistency separately. Values marked **Not yet standardized** describe gaps in the current implementation and must not be filled by invention.

# 1. Introduction

## Purpose

GyanPath needs one shared language for designing, reviewing and implementing interfaces. This document records that language so public study pages, readers, question tools and role-based management screens remain recognizably part of the same product.

## Scope

This system covers visual identity, tokens, layouts, reusable UI components, interaction states, responsive behavior, accessibility and interface writing. It applies to server-rendered Eta templates, JavaScript-rendered UI and legacy screens when they are deliberately migrated.

It is not an application architecture, CSS property catalog, route specification or permission to redesign working screens.

## Design philosophy

GyanPath is a calm, approachable study workspace. Academic content is primary. Interface chrome provides orientation and action without competing with reading. Cool blues, blue-gray backgrounds, white or translucent surfaces, rounded cards and soft depth create a friendly environment rather than an institutional portal.

The system supports progressive enhancement: useful structure and content should render from the server; JavaScript adds live data, filtering, dialogs, preferences and richer workflows.

## User experience goals

- Help IGNOU MCA students find material quickly and return to learning.
- Make dense catalogs and question content feel organized, not overwhelming.
- Keep public pages welcoming and management tools efficient.
- Preserve context across navigation, filtering and master-detail workflows.
- Make important states understandable without relying on color or animation.
- Remain usable with keyboard, screen reader, touch, zoom and reduced motion.

# 2. Brand Identity

| Attribute | GyanPath standard |
|---|---|
| Personality | Calm, practical, encouraging, resourceful and student-centered |
| Tone | Clear and conversational; helpful without sounding childish or bureaucratic |
| Visual character | Cool blue foundation, navy anchors, pale backgrounds, rounded surfaces, restrained depth and selective bright academic accents |
| Density | Spacious on public/reading pages; compact but structured in dashboards and admin tools |
| Imagery | Brand logo, academic documents, contributor images, announcement art and content diagrams; decoration remains secondary |
| Desired feeling | “My study material is organized, understandable and under control.” |

Preserve the current logo, favicon family, primary blue, heading/body font personalities, rounded card silhouette, public shell and themeable reading experience. Do not make GyanPath resemble a generic enterprise dashboard or an external component library.

# 3. Core Design Principles

## Content First

Study resources, questions, answers and operational data must dominate the hierarchy. Navigation and controls should be easy to locate but quieter than the content. Avoid decorative elements that consume reading space or interrupt scanning.

## Calm Learning Environment

Use pale backgrounds, legible text, measured spacing and soft surfaces. Reserve saturated color for actions, status and meaningful grouping. Dense screens require stronger structure, not more decoration.

## Consistency

Reuse existing component patterns and tokens. The same role should look and behave the same across server-rendered and JavaScript-rendered interfaces. Different shells may vary in composition, not in basic control language.

## Accessibility

Accessibility is part of the component contract. Native semantics, keyboard access, visible focus, contrast, touch sizing, zoom/reflow and reduced motion are required—not optional polish.

## Minimal Cognitive Load

Use familiar labels, one obvious primary action, clear grouping and predictable state feedback. Do not expose implementation terminology to students. Avoid multiple visual treatments for the same meaning.

## Progressive Enhancement

Server-render meaningful structure and core content. JavaScript may enhance filtering, authentication state, live data and dialogs, but must not erase basic orientation or leave unexplained empty containers.

## Role-Appropriate Density

Public pages prioritize reassurance and discovery. Readers prioritize content area. Dashboards and admin pages may be denser, but must keep hierarchy, readable metadata and safe destructive actions.

## Preserve Before Extending

New work should fit the current product. Do not introduce new palettes, spacing scales, corner styles or control families to solve a local problem.

# 4. Design Tokens

The official implemented tokens live in `frontend/assets/css/base.css`. Compatibility aliases are still used across current pages. New UI should use the `--app-*`, spacing, radius and component tokens already implemented. Semantic roles absent from the code are explicitly noted below.

## Colors

### Default/light theme

| Role | Official token | Current value | Usage |
|---|---|---:|---|
| Background gradient | `--app-background` | `linear-gradient(135deg, #eef3f8, #dfe7f0)` | Main calm page backdrop |
| Background solid | `--app-background-solid` | `#edf3fa` | Solid page/tool background |
| Primary | `--app-primary` | `#2563eb` | Primary actions, focus accents, links where inherited |
| Primary dark | `--app-primary-dark` | `#0d4fa9` | Hover/strong primary treatment |
| On primary | `--app-primary-text` | `#ffffff` | Text/icons on primary |
| Sidebar start | `--app-sidebar` | `#07172e` | Dark navigation/sidebar |
| Sidebar end | `--app-sidebar-end` | `#102747` | Sidebar gradient/end and dark accent |
| Text | `--app-text` | `#1f2937` | Body/UI copy |
| Heading | `--app-heading` | `#0f172a` | Headings and strongest labels |
| Muted | `--app-muted` | `#64748b` | Secondary text and metadata |
| Surface | `--app-surface` | `#ffffff` | Cards, fields and raised content |
| Translucent surface | `--app-surface-translucent` | `rgba(255,255,255,.92)` | Glass-like public cards |
| Card translucent | `--app-card-translucent` | `rgba(255,255,255,.48)` | Lighter layered cards |
| Surface soft | `--app-surface-soft` | `#f1f5f9` | Subdued panels and controls |
| Surface softer | `--app-surface-softer` | `#f8fafc` | Quiet nested surface |
| Border | `--app-border` | `#dbe3ee` | Default boundaries |
| Border strong | `--app-border-strong` | `#d0d5dd` | Emphasized boundaries |
| Success | `--app-success` | `#16a34a` | Confirmed/success states |
| Warning | `--app-warning` | `#ea580c` | Caution and attention |
| Error | `--app-danger` | `#dc2626` | Errors/destructive actions |
| Error dark | `--app-danger-dark` | `#b91c1c` | Destructive hover/emphasis |
| Paper | `--app-paper` | `#fffdf5` | Reading/question paper surface |
| Shadow color | `--app-shadow-color` | `rgba(15,23,42,.12)` | Theme-aware soft depth |

### Additional roles

| Requested role | Current standard |
|---|---|
| Secondary | Navy (`--app-sidebar`/`--app-sidebar-end`) is the established secondary family; no general-purpose `secondary` token exists |
| Accent | `--accent` is a compatibility alias of `--app-primary`; contextual semester accents exist locally |
| Info | **Not yet standardized**; blue is used contextually but no official info token exists |
| Link | **Not yet standardized** as a dedicated token; existing pages normally derive links from primary/accent styles |
| Overlay | **Not yet standardized**; current dialogs use several literal dark translucent values |
| Selected | **Not yet standardized**; components use primary/contextual accents |
| Disabled | Current global rule mixes muted text with surface; dedicated color tokens are **Not yet standardized** |

Never assign a new raw value to one of these missing roles. Use an established component treatment or mark the work **Not yet standardized** for design review.

### Implemented themes

| Theme | Primary | Background | Text | Surface | Purpose |
|---|---|---|---|---|---|
| Default/light | `#2563eb` | `#edf3fa` | `#1f2937` | `#ffffff` | General portal use |
| Dark | `#60a5fa` | `#0f172a` | `#e5e7eb` | `#172033` | Low-light reading/UI |
| Sepia | `#8a5a2b` | `#d8c6a3` | `#463724` | `#f4ecd8` | Warm paper-like reading |
| Pink | `#db2777` | `#fff1f7` | `#4a2035` | `#fff8fb` | Alternate personalized theme |
| Sky blue | `#0284c7` | `#eaf9ff` | `#17354a` | `#f7fdff` | Alternate cool reading theme |

Theme changes must flow through existing tokens. Component selectors must not override theme colors with unreviewed literals.

## Typography

### Families

| Role | Token | Stack |
|---|---|---|
| Body | `--font-body` | Inter, Segoe UI, Roboto, Arial, sans-serif |
| UI | `--font-ui` | Inter, Segoe UI, Roboto, Arial, sans-serif |
| Heading | `--font-heading` | Poppins, Segoe UI, Arial, sans-serif |
| Reading/content | `--font-content` | Merriweather, Georgia, Times New Roman, serif |
| Code | `--font-code` | Roboto Mono, Cascadia Code, Consolas, monospace |

### Scale and hierarchy

A complete named type scale is **Not yet standardized**. Current implementation uses rem values and responsive `clamp()` headings.

| Content | Current standard |
|---|---|
| Page title (`h1`) | Largest heading on a page; Poppins; one meaningful `h1` per page |
| Section title (`h2`) | Poppins, clearly below page title |
| Subsection (`h3`+) | Poppins or UI family; preserve semantic nesting |
| Body | 1rem target with readable body line height; Inter stack |
| Reading answer/content | Merriweather stack where a paper/answer reading mode is used |
| Label | `--label-font-size: .78rem`; weight commonly 700–800 |
| Metadata | `--meta-font-size: .72rem`; do not create essential text smaller than this |
| Badge | `--badge-font-size: .8rem` |
| Table | `--table-font-size: .8rem` |
| Button | `--button-font-size: .78rem` |
| Code | Code family; retain whitespace and strong contrast |

Avoid new 9–11px essential text. Do not choose heading sizes only for appearance; use correct semantic order and style it.

## Spacing

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-7` | 28px |
| `--space-8` | 32px |

Established layout/component values include `--page-gutter: 30px`, `--layout-gap: 24px`, `--panel-padding: 26px`, `--panel-padding-compact: 18px`, `--card-padding: 15px`, `--card-padding-lg: 26px`, `--toolbar-gap: 14px`, `--filter-gap: 10px` and `--action-gap: 14px`.

Use the 4px scale for new gaps/margins. Existing off-scale component tokens remain official compatibility values until migrated; do not create additional off-scale values.

## Radius

| Token | Value | Typical use |
|---|---:|---|
| `--radius-sm` | 8px | Small controls |
| `--radius-md` | 10px | Fields and buttons |
| `--radius-lg` | 14px | Cards |
| `--radius-xl` | 18px | Large cards/dialogs |
| `--radius-panel` | 20px | Major panels |
| `--badge-radius` | 999px | Pills and badges |
| Circle | 50% | Avatars/circular icon controls |

New corner values are not allowed. Distinct existing 12/16/24px silhouettes should be migrated only after visual review.

## Shadows

| Level | Current standard |
|---|---|
| Flat | No shadow; borders separate content |
| Default raised | `--app-shadow: 0 12px 32px var(--app-shadow-color)` |
| Interactive hover | Existing cards use stronger local shadows; **Not yet standardized** as a token |
| Popover | **Not yet standardized** |
| Dialog | Existing implementations use deeper local shadows; **Not yet standardized** |

Use the default shadow sparingly. A border plus surface is preferred for routine structure. Do not invent elevation values.

## Motion

| Property | Current standard |
|---|---|
| Common duration | Approximately 180–250ms in existing controls/cards |
| Card tilt | Existing special behavior for eligible cards |
| Easing tokens | **Not yet standardized** |
| Duration tokens | **Not yet standardized** |
| Reduced motion | Required policy; full shared implementation is **Not yet standardized** |

Transitions must name properties and remain short. Hover may adjust color, border, shadow or small transform. Do not animate reading content, layout dimensions or large distances. Under `prefers-reduced-motion: reduce`, remove tilt/parallax, smooth scrolling and nonessential movement; state feedback must remain.

## Breakpoints

The code currently uses several close breakpoints. The official behavioral bands are documentation conventions, not implemented global tokens:

| Band | Reference width | Intent |
|---|---:|---|
| Compact | 600px | Small phone/viewer changes |
| Mobile | 700px | Public navigation, forms and cards stack |
| Tablet | 800px | Side content and toolbars reorganize |
| Workspace | 960px | Reader/master-detail adaptation |
| Wide | 1200px | Large catalog/dashboard adjustment |

Existing 640, 650, 760, 768 and 900px queries remain valid compatibility behavior. Breakpoint consolidation is **Not yet standardized** and requires page-by-page visual verification.

# 5. Layout System

| Layout | Current language | Rules |
|---|---|---|
| Public pages | Shared header/navigation, optional breadcrumb, centered content, share/support footer | Maintain generous whitespace and one clear page purpose |
| Information pages | `info-page` with one or more rounded `info-card`s | Keep readable line length and straightforward heading flow |
| Dashboard | Dark/role-aware navigation plus cards, shortcuts and management content | Prioritize task grouping; avoid turning every item into equal emphasis |
| Admin | Sidebar/topbar, filters/toolbars, cards/tables and dialogs | Compact is acceptable; readable labels and safe destructive states are mandatory |
| Reader | Compact tool header plus maximum document area | Controls remain secondary to the PDF/content; preserve direct fallback actions |
| Master-detail tools | Sidebar/list/detail columns in question bank and chat | Preserve context and selection; mobile focus behavior is not yet standardized |
| Catalog | Sidebar/sticky section navigation and responsive card groups | Semester/type hierarchy must remain visible |
| Standalone tools | Gallery/viewer/access-denied may omit the public shell | Still use brand tokens, typography and component language |

## Containers and alignment

- Main content reference: `--content-width: 1100px`.
- Public gutter: `--page-gutter: 30px`, reduced responsively by page CSS.
- Standard layout gap: `--layout-gap: 24px`.
- Standard sidebar: `--sidebar-width: 220px`.
- Application sidebar: `--app-shell-sidebar-width: 280px`.
- Master-detail list: `--app-shell-list-width: 410px`.
- Management content: `calc(100vw - 268px)` currently.
- Align related controls to a shared baseline and group them by task.
- Prefer CSS Grid for card/catalog structure and flex layout for linear toolbars/actions.
- Responsive grids should reduce columns before shrinking cards below readable widths.
- Do not center dense tables or long reading text merely for symmetry.

# 6. Component Library

The following specifications formalize current patterns. A shared implementation class does not yet exist for every item. “Not yet standardized” means reuse the closest existing page pattern and request review rather than creating a new style.

## Button

| Item | Standard |
|---|---|
| Purpose | Trigger an action or provide a visually prominent navigation action |
| Variants | Primary, secondary/outlined, ghost, danger, link; shared class API not yet standardized |
| States | Default, hover, active, focus-visible, disabled; loading presentation not yet standardized |
| Accessibility | Native `button` for actions; anchor for navigation; descriptive text; preserve disabled semantics |

Do: use primary blue for the single main action; use explicit destructive labels.  
Don't: invent a new gradient, radius or button color; style a generic `div` as a button.

## IconButton

| Item | Standard |
|---|---|
| Purpose | Compact action represented by an icon, such as password reveal or more actions |
| Variants | Neutral, primary, danger; visual API not yet standardized |
| States | Same as Button |
| Accessibility | Accessible name required; decorative icon hidden; square touch target |

Do: use for familiar compact actions.  
Don't: rely on the glyph alone or mix multiple icon sizes in one toolbar.

## Card

| Item | Standard |
|---|---|
| Purpose | Group one coherent resource, subject, contributor, lecture, question or summary |
| Variants | Standard, translucent, interactive, media, compact, contextual-accent |
| States | Default; hover/selected only when interactive; loading/empty supplied by state content |
| Accessibility | Use article/section semantics when appropriate; interactive behavior belongs to a real link/button |

Do: use soft border, established radius and restrained shadow.  
Don't: make every card float or tilt; nest unrelated actions without hierarchy.

## Panel

| Item | Standard |
|---|---|
| Purpose | Larger structural grouping for forms, side content, filters or workspace regions |
| Variants | Surface, soft, translucent, paper, sidebar |
| States | Usually static; may own `aria-busy` during updates |
| Accessibility | Label the region when its purpose is not obvious from a heading |

Do: use panels to clarify a layout region.  
Don't: use a panel only to add decoration around a single line.

## Field

| Item | Standard |
|---|---|
| Purpose | Collect one-line text, email, password, number or related input |
| Variants | Standard, search, compact management; shared API not yet standardized |
| States | Default, hover, focus, invalid, disabled, readonly, success where confirmed |
| Accessibility | Visible label; help/error association; native type and autocomplete |

Do: keep labels persistent and errors adjacent.  
Don't: use placeholder as the only label.

## TextArea

Purpose: multi-line user content. Variants and shared sizing are **Not yet standardized**. It follows Field colors, radius, focus and validation rules. Preserve resize unless a layout requirement proves otherwise. Do not use it for structured data better represented by dedicated fields.

## Select

Purpose: choose one value from a moderate known list. Use native `<select>` and Field styling. States match Field. A custom listbox/select is **Not yet standardized**. Do not replace native behavior for appearance alone.

## Checkbox

Purpose: select independent options. Current shared visual treatment is **Not yet standardized**. Use native checkbox semantics, a clickable visible label and checked/disabled/focus states. Do not use a checkbox for a mutually exclusive choice.

## Radio

Purpose: select exactly one option from a visible group. Current shared visual treatment is **Not yet standardized**. Use native radios, `fieldset`/`legend` for the group and keyboard-native behavior. Do not use radios when options are hidden in a dropdown.

## Switch

Purpose: immediate binary setting. **Not yet standardized**. Until a true switch pattern is approved, prefer a checkbox with clear label. Do not use switch visuals for actions requiring Save/Submit.

## Search Field

Purpose: filter a visible collection or catalog. Use `type="search"`, an accessible label and clear placeholder examples. Result behavior belongs to the page. Clear-button styling and result announcements are **Not yet standardized**. Do not announce the entire result grid after every keystroke.

## Badge

Purpose: compact metadata such as subject, language, category or count. It uses pill radius and small UI text. Badges are neutral/contextual and noninteractive by default. Do not use a badge as the only representation of critical state.

## Status Chip

Purpose: communicate state such as solved, reported, active, pending, success or danger. Use text and semantic color together. Cross-domain status mappings and a shared class API are **Not yet standardized**. Do not assign different colors to the same status across pages.

## Avatar

Purpose: identify a contributor, participant or account. Existing variants include image, initials and colored circles. Shared sizes/fallback-color rules are **Not yet standardized**. Images need meaningful alt only when not redundantly labelled nearby; initials should be hidden from duplicate announcement.

## Alert

Purpose: persistent in-context information, warning or error. A shared visual implementation is **Not yet standardized**. Use a heading when substantial, concise recovery guidance, and `role="alert"` only for urgent dynamically introduced errors. Do not use alert styling for routine decoration.

## Toast

Purpose: transient confirmation or nonblocking feedback; current toast utilities/region exist. Tones include neutral, success, warning and error in practice, but timing is **Not yet standardized**. Use polite announcements for routine updates. Do not auto-dismiss critical instructions before users can act.

## Modal

Purpose: interrupt for a focused task that cannot remain inline. Existing modal utility exists; shared visual/behavior contract is not fully standardized. It requires a labelled title, close action, focus containment, Escape behavior where safe and focus return. Do not open a modal for content that belongs on a page.

## Dialog

Purpose: native or custom focused interaction, including announcement details and confirmations. Prefer native `<dialog>` where already used. Destructive confirmation wording and conversion of existing custom dialogs are **Not yet standardized**. Do not close a destructive dialog through an ambiguous primary label.

## Tabs

Purpose: switch among closely related views without navigation. Existing account tabs and segmented controls establish selected styling. Keyboard arrow/Home/End behavior is not consistently standardized. Use correct tab roles only when implementing the full keyboard/ARIA pattern; otherwise use buttons/navigation appropriate to behavior.

## Breadcrumb

Purpose: show location and provide a path back. Existing breadcrumb component/CSS is official. Use an accessible navigation label, ordered hierarchy and current-page text. Do not use breadcrumbs as the page title or include unrelated shortcuts.

## Pagination

Purpose: navigate discrete result pages. **Not yet standardized**; many current collections use filtering/scrolling instead. Any future implementation must use navigation semantics, descriptive previous/next labels, current-page state and reachable touch targets. Do not invent pagination styling locally.

## Toolbar

Purpose: group filters, context and actions for a collection or workspace. Current variants exist in readers, lectures and management pages; shared implementation is not yet standardized. Keep DOM/focus order logical when wrapping. Do not give every action primary emphasis.

## Data Table

Purpose: compare structured records across consistent columns. Existing management tables use table semantics, minimum widths and horizontal scrolling. Shared states and responsive alternatives are not yet standardized. Preserve captions/headings, headers and scroll access. Do not hide columns or convert to cards without manual review.

## Empty State

Purpose: explain that valid content/results are absent. Existing pages provide textual empty states. Shared visual component is **Not yet standardized**. State what is empty and provide a relevant next action when one exists. Do not blame the user or display a blank container.

## Error State

Purpose: explain failure and recovery. Existing login, viewer and toast errors establish concise messaging; shared visual component is **Not yet standardized**. Name the problem in plain language and offer retry/back/contact guidance. Do not expose stack traces or raw API codes.

## Loading State

Purpose: show that requested content is in progress. Current pages use “Loading…” and pending containers; shared spinner/skeleton is **Not yet standardized**. Preserve layout where possible, set `aria-busy` on the updated region and announce only meaningful delay/state changes.

## Skeleton

**Not yet standardized.** Do not introduce a new skeleton style ad hoc. If approved later, it must resemble the final layout, be hidden from assistive technology and become static/absent under reduced motion.

## Navigation

Purpose: orient users among primary pages. The shared public header/footer navigation is official. Current page uses `aria-current="page"`; mobile behavior must preserve labels and keyboard order. Do not add a top-level destination without information-architecture review.

## Sidebar

Purpose: persistent section/workspace navigation in catalogs, question tools and management screens. Established widths are 220px and 280px. Active state must use more than color and remain semantically current. Mobile collapse/focus behavior is **Not yet standardized** across all shells.

## Footer

Purpose: close public pages with product context, share/support actions, disclaimer and secondary navigation. The shared footer partial is official. Keep sharing/support distinct from primary study actions. Standalone readers may omit it intentionally.

# 7. Icons

- Current icon language mixes Unicode arrows/symbols, deliberate emoji, CSS-drawn password eyes, raster brand assets and content SVGs.
- A reusable SVG icon set is **Not yet standardized**. Do not import one without approval.
- Official icon sizes are **Not yet standardized**; match neighboring control text and maintain consistent size within a component group.
- Icon-only controls require an accessible name.
- Decorative icons use `aria-hidden="true"` or empty alt text.
- Emoji may support friendly community/testing content, but should not be the sole label for an action or state.
- Avoid emoji in dense management tools when a text label is clearer.
- Content diagrams/SVGs are learning material, not interface icons.
- Do not distort the brand logo or use it as a generic action icon.

# 8. Forms

| Topic | Standard |
|---|---|
| Labels | Visible, concise and associated with the control |
| Help text | Explains format or consequence before an error occurs; linked with `aria-describedby` |
| Validation | Validate at a useful moment; preserve entered values; focus the first actionable problem on submit when appropriate |
| Errors | Plain language, adjacent to field, `aria-invalid="true"`, associated error ID; summary pattern not yet standardized |
| Disabled | Use only when interaction is unavailable; current global muted/grayscale treatment applies; explain why when non-obvious |
| Readonly | Keep legible and selectable; distinguish from disabled behavior |
| Success | Confirm meaningful saved/completed actions; field-level success visuals are not yet standardized |
| Required | Use native `required`; communicate requirement in text, not color/asterisk alone |
| Passwords | Preserve autocomplete; reveal button has accessible pressed/name state |
| Submission | Prevent accidental duplicate submission; standard loading-button presentation is not yet standardized |

Keep forms in logical reading order. Group related fields with `fieldset`/`legend`. Do not clear forms after recoverable errors.

# 9. Accessibility

## Keyboard navigation

All interactive elements must be reachable in logical order. Native controls retain native keys. Dialogs, tabs, menus and master-detail panes need their complete expected keyboard behavior; partial ARIA patterns are not acceptable.

## Focus Visible

Never remove focus without replacement. Current fields have `--field-focus-ring`; a universal focus-visible implementation is **Not yet standardized**. New UI must use a high-contrast, theme-aware outline/ring visible against page, surface, primary and navy backgrounds.

## ARIA

Prefer native HTML. Use `aria-current` for current navigation, `aria-expanded`/`aria-controls` for disclosure, `aria-pressed` for toggle buttons, `aria-busy` for updating regions and concise live regions for status. IDs referenced by ARIA must exist and remain unique.

## Screen readers

Maintain headings and landmarks, meaningful alt text, labelled regions and concise dynamic announcements. Decorative content must not create noise. Do not announce large result containers after small filter changes.

## Contrast

Target WCAG AA: 4.5:1 for normal text, 3:1 for large text and meaningful UI graphics/boundaries. Verify default, dark, sepia, pink and sky-blue themes. Literal contextual accents require manual checking.

## Reduced motion

Honor `prefers-reduced-motion`. Remove nonessential tilt, parallax, autoplay movement and smooth scrolling; keep immediate state changes. A comprehensive shared rule is **Not yet standardized**.

## Touch targets

Aim for 44×44px for navigation, primary controls and icon buttons. Compact management actions below this require an equivalent enlarged hit area and manual review.

## Zoom support

Support 200% zoom without lost content/actions and reflow toward 400% where WCAG requires it. Avoid fixed heights for text containers. Horizontal data-table scrolling may remain when preserving tabular relationships.

# 10. Responsive Design

| Context | Expected behavior |
|---|---|
| Desktop/wide | Full public navigation, multi-column catalogs, sidebar/workspace layouts and complete toolbars |
| Laptop | Preserve structure while reducing grid columns and allowing toolbars to wrap |
| Tablet | Stack secondary side content, reorganize reader controls, narrow sidebars and preserve master-detail context |
| Mobile | Single-column public content, compact navigation, wrapped actions, readable cards and explicit pane transitions |

Responsive components must preserve semantic order, accessible names, focus and all actions. Cards reduce columns before becoming cramped. Toolbars wrap without visual/keyboard reordering. Modals keep safe viewport margins. Admin tables currently scroll horizontally; alternative mobile representations are **Not yet standardized**. Chat and question-bank pane transitions are **Not yet standardized** and require manual review.

# 11. Animation

## Hover

Use subtle color, border, shadow or small transform changes only on interactive elements. Hover cannot be the only state cue and should be gated for devices that support hover.

## Loading

Animation must communicate progress, not decorate delay. A shared spinner/skeleton language is **Not yet standardized**. Always provide a textual/semantic loading state.

## Transitions

Keep common transitions around the current 180–250ms range. Name properties; avoid `transition: all`. Large layout motion and long easing are not part of GyanPath's calm language.

## Micro-interactions

Password reveal, tab selection, card hover, dialog opening and toast arrival may use restrained feedback. Card tilt is a special existing enhancement, not a default card behavior. All micro-interactions must have a reduced-motion equivalent.

# 12. Writing Guidelines

| Element | Standard | Example |
|---|---|---|
| Headings | Specific, sentence case, task/content focused | “Previous year question papers” |
| Buttons | Verb-led and explicit | “Save profile”, “Read PDF”, “Try again” |
| Error messages | State what happened and what to do; no blame | “The PDF could not be loaded. Try again or download it directly.” |
| Success messages | Confirm the completed action briefly | “Profile updated.” |
| Empty states | Name the empty scope and next useful step | “No lectures match these filters. Clear a filter to see more.” |
| Tooltips | Supplement unfamiliar icon/action; do not contain essential instructions | “Copy link” |
| Confirmation dialogs | Name the consequence and action explicitly | “Delete this banner?” / “Delete banner” |

Use “GyanPath” consistently. Prefer “you” and plain language. Avoid raw technical errors, unexplained abbreviations, exaggerated marketing claims and vague buttons such as “OK” when a specific verb is available.

# 13. AI Rules

1. Read this document before any UI change. Consult `UI_AUDIT.md` and `DESIGN_PLAN.md` for evidence and migration constraints.
2. Always reuse an existing component or pattern before adding one.
3. Never invent a new button style, color role, spacing value, radius, shadow or animation.
4. Always use existing design tokens. Never hardcode a new color.
5. Never duplicate existing UI markup or CSS when a shared partial/module/pattern already exists.
6. Never copy or emulate Material Design, Tailwind, Bootstrap, shadcn/ui, Ant Design or another external system.
7. Preserve GyanPath's calm blue identity, rounded surfaces, soft depth and established typography.
8. Prefer CSS refactoring over JavaScript, API or business-logic changes.
9. Preserve IDs, `data-*`, form names, ARIA references and JS-consumed classes unless every dependency is verified.
10. Maintain native semantics, keyboard access, visible focus, contrast, reduced motion and touch usability.
11. Check server-rendered and JavaScript-rendered consumers before moving or deleting selectors.
12. Do not use `!important` to conceal specificity or migration errors.
13. Do not declare protected/admin UI visually verified unless it was rendered with authorized access.
14. Test affected UI in all five implemented themes and at desktop, tablet and mobile widths.
15. Preserve loading, empty, error, disabled, selected and permission states.
16. If this document says **Not yet standardized**, do not invent the missing rule; reuse the closest current pattern and request manual review.
17. Do not change chat, question-bank, PDF, legacy paper, modal focus or table behavior during visual cleanup unless explicitly authorized.
18. Keep patches scoped and report visual/manual-review limitations honestly.

# 14. Future Extensions

## New pages

1. Choose an existing shell: public, information, catalog, reader, dashboard/admin or master-detail.
2. Reuse the shared header/footer/sidebar/breadcrumb as appropriate.
3. Compose existing cards, fields, buttons, toolbars and state patterns.
4. Add page CSS only for page composition, not for reimplementing components.
5. Provide loading, empty, error, permission and responsive behavior before release.
6. Verify five themes, keyboard flow, zoom and representative widths.

## New components

A new component is justified only when existing components cannot express a repeated interaction. Document purpose, variants, states, accessibility and responsive behavior before implementation. Use existing tokens, add a GyanPath-owned class, provide a server/JS-compatible contract and migrate at least two real consumers before calling it shared.

Missing semantics or new token roles require manual design review. Do not expand the palette or scale for one page.

# 15. Appendix

## Naming conventions

| Item | Convention |
|---|---|
| New shared component class | `.gp-component` |
| Variant | `.gp-component--variant` |
| Child element | `.gp-component__part` |
| State | Semantic attribute first (`aria-*`, `data-state`); `.is-*` only for presentation compatibility |
| JavaScript hook | Prefer `data-*`; do not couple new behavior to purely visual classes |
| Tokens | Existing `--app-*`, `--space-*`, `--radius-*`; new roles require review |
| Page class | Route/domain-specific, scoped under the page root |

The `.gp-*` namespace is the approved direction from the implementation plan; most current components still use legacy descriptive classes. Migration must be incremental.

## File organization

Current official files remain under `frontend/assets/css`. The intended organization when refactoring is:

```text
css/
  base.css
  layouts/
    public-shell.css
    management-shell.css
    reader-shell.css
    master-detail.css
  components/
    button.css
    field.css
    card.css
    badge.css
    toolbar.css
    data-table.css
    state-panel.css
    dialog.css
    toast.css
  pages/
    home.css
    resources.css
    question-bank.css
    dashboard.css
    admin.css
    ...
```

This is an organization standard for migration, not permission to move files without route/load-order verification. `app-paper.css` and legacy `style.css` remain isolated until manually reviewed.

## CSS conventions

- Tokens and themes belong in `base.css`.
- Shared component files contain component visuals and states, not route composition.
- Page files arrange components and hold genuinely page-specific exceptions.
- Keep specificity low; scope page exceptions under a page root.
- Use logical properties where they preserve current behavior.
- Use Grid for two-dimensional page/card layouts and Flexbox for linear groups.
- Do not use inline styles except narrowly scoped dynamic custom properties such as progress values.
- Do not add unexplained literals, global element overrides or broad `!important` rules.
- Preserve source/load order during extraction and remove compatibility selectors only after repository-wide verification.

## Recommended implementation pattern

1. Identify every existing consumer in Eta and JavaScript.
2. Capture the current rendered state and all relevant variants.
3. Add or reuse tokens without changing computed output.
4. Extract exact CSS into the correct ownership file.
5. Add a shared `.gp-*` contract alongside legacy selectors.
6. Migrate one page family at a time.
7. Verify default, dark, sepia, pink and sky-blue themes.
8. Verify keyboard, focus, states, 200% zoom and responsive widths.
9. Remove old declarations only when no consumer remains.
10. Mark unresolved behavior **Not yet standardized** and request manual review.

## Current known gaps

Dedicated info/link/overlay/disabled/selected tokens, a complete type scale, elevation levels, z-index and motion tokens, a shared icon set, pagination, switch, skeleton, universal focus-visible styling, breakpoint consolidation and several component APIs are **Not yet standardized**. Their absence is not permission to invent local alternatives.
