# Design System

Reusable shadcn-based UI foundation for a fast food product with Apple-inspired minimalism and mobile-first ergonomics.

## Principles

- Mobile first: primary controls use at least 44px tap targets.
- Fast paths: action components are compact, high-contrast, and easy to scan.
- Minimal surfaces: use quiet neutral backgrounds, restrained shadows, and crisp borders.
- Operational color: tomato red for primary action, warm yellow for urgency, green for completion.

## Tokens

Theme tokens live in `src/app/globals.css` and are exposed through Tailwind in `tailwind.config.ts`.

- `primary`: main action color.
- `accent`: speed or urgency highlight.
- `success`: ready, completed, available.
- `warning`: rush, delayed, attention needed.
- `surface`: subtle section background.
- `shadow-apple-sm` / `shadow-apple-md`: soft depth for floating controls and compact cards.

## Primitives

Use shadcn-style primitives from `src/components/ui`.

```tsx
import { Badge, Button, Card, Input, Label, Separator, Textarea } from "@/components/ui";
```

Available primitives:

- `Button`
- `Badge`
- `Card`
- `Input`
- `Label`
- `Separator`
- `Textarea`

## Compositions

Use product-ready building blocks from `src/components/design-system`.

```tsx
import {
  AppFrame,
  AppHeader,
  BottomActionBar,
  BottomActionGroup,
  EmptyState,
  MetricTile,
  MobileViewport,
  PageSection,
  StatusChip
} from "@/components/design-system";
```

Available compositions:

- `AppFrame`: full app background wrapper.
- `MobileViewport`: constrained mobile-first viewport.
- `AppHeader`: sticky blurred mobile header.
- `PageSection`: default mobile page spacing.
- `BottomActionBar`: safe-area-aware sticky action zone.
- `BottomActionGroup`: two-column mobile action layout.
- `EmptyState`: neutral empty/loading/error shell.
- `MetricTile`: compact KPI tile.
- `StatusChip`: operational status label.

## Status Tones

`StatusChip` supports:

- `neutral`
- `live`
- `ready`
- `rush`
- `blocked`

## Data Access

UI components should receive data through props or repositories. Do not call Supabase directly from React components.
