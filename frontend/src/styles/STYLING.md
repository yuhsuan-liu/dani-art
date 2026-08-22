# UI styles

All visual primitives live in `frontend/src/styles/ui.css`.
Use the class names below instead of one-off Tailwind on buttons and frames.

Import is already wired from `src/index.css`.

## iPhone (Safari + Chrome)

Chrome on iOS uses **WebKit** — the same engine as Safari. Style once.

| Rule | Spec |
|---|---|
| Tap target | `min-h-touch` / `min-w-touch` = **44px** (Apple HIG) |
| Viewport | `width=device-width, initial-scale=1, viewport-fit=cover` |
| Height | `100dvh` / `85dvh` — never `100vh` (iOS URL bar resizes) |
| Safe area | `pt-safe-t` `pb-safe-b` for notch + home indicator |
| Inputs | `text-base` (16px) so iOS does not zoom on focus |
| Hover | Desktop only (`@media (hover: hover)`). Phone path is tap → modal |
| Touch | `touch-action: manipulation` on controls (no double-tap zoom delay) |

## Frames

| Class | Use |
|---|---|
| `frame` | Outer soft white rounded rectangle (page shells) |
| `frame-inset` | Inner grey rounded rectangle (calendar, each post) |
| `art-frame` | Picture-frame on **sold** furniture / gallery images |

## Buttons

Every button is a **framed rounded rectangle** — pick a letter, don’t restyle inline.

| Class | Style | Use |
|---|---|---|
| `btn-a` | Dark fill, dark border | Primary: save, post, purchase |
| `btn-b` | White fill, grey border | Secondary: notes, cancel, login |
| `btn-c` | Light grey fill, soft border | Quiet: photo / video, add, remove |
| `btn-danger` | White fill, red border | Delete |

Add `w-full sm:w-auto` at the call site when a button should stretch on mobile.

## View switch (Gallery \| Floor plan)

Not “Room” — that’s a living room *inside* the plan. The customer switch is:

| Class | Use |
|---|---|
| `view-switch` | Full-width **Gallery \| Floor plan** on phone |
| `view-switch-compact` | Smaller **Grid \| List** — does not eat the full row |
| `view-switch-tab` | Inactive side |
| `view-switch-tab-active` | Current side |

Labels: **Gallery** (paintings) and **Floor plan** (wishlist map).

## Nav

| Class | Use |
|---|---|
| `nav-bar` | Pill cluster; full width on phone |
| `nav-pill` | Inactive nav item |
| `nav-pill-active` | Current page |

## Form

| Class | Use |
|---|---|
| `input-line` | Underline-only field (composer, calendar) |
| `input-box` | Framed text field (forms) |

## Feed (Threads-like)

| Class | Use |
|---|---|
| `avatar` | 40px circle profile photo |
| `avatar-lg` | 64px circle |
| `thread-head` | Row: avatar + name / @handle |
| `thread-name` | Display name |
| `thread-meta` | `@dani · Aug 20` |

## Gallery + floor plan

| Class | Use |
|---|---|
| `gallery-grid` | 2-col phone → 4-col desktop |
| `gallery-card` | One painting |
| `furn-piece` | Furniture hit target on the plan |
| `furn-tag` | Name + price + Hold/Sold |
| `furn-art-preview` | Painting overlay on desktop hover |
| `room-frame` | Outer floor plan container with shadow |
| `room-shell` | Walls + floor + carpet inside the plan |
| `room-walls-warm` / `room-walls-neutral` | Wall tone |
| `room-floor-oak` / `room-floor-plain` | Floor material |
| `room-carpet-sand` / `rose` / `slate` / `off` | Area rug (toggle in edit mode) |
| `furn-muted` | Unsold furniture — greyed until funded |
| `sheet` | Bottom sheet on phone, centered dialog on desktop |

## Footer

| Class | Use |
|---|---|
| `site-footer` | Page footer bar |
| `site-footer-inner` | Centered credit + disclaimer stack |
| `footer-icon` | 44px GitHub / LinkedIn tap target |

To add a new style: define it once in `ui.css`, list it here, then use the class in components.
