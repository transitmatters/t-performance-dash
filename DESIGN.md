---
name: TransitMatters Data Dashboard
description: An independent, data-first view of MBTA performance, run by TransitMatters.
colors:
  signal-brick: '#a31e1e'
  depot-charcoal: '#2e2d2c'
  depot-charcoal-raised: '#46453f'
  sidebar-text: '#e7e5e4'
  stone-ground: '#f5f5f4'
  card-white: 'oklch(1 0 0)'
  ink: 'oklch(0.145 0 0)'
  ink-muted: 'oklch(0.54 0 0)'
  hairline: 'oklch(0.922 0 0)'
  quiet-fill: 'oklch(0.97 0 0)'
  neutral-primary: 'oklch(0.205 0 0)'
  destructive: 'oklch(0.577 0.245 27.325)'
  line-red: '#d13434'
  line-orange: '#ed8b00'
  line-blue: '#003da5'
  line-green: '#00834d'
  line-bus: '#f5b400'
  line-silver: '#7c878e'
  line-commuter-rail: '#80276c'
  line-ferry: '#008eaa'
typography:
  page-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '1rem'
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  figure:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '0.875rem'
    fontWeight: 600
    fontFeature: "'tnum'"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
  status-caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: '11px'
    fontWeight: 400
    lineHeight: 1.25
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  full: '9999px'
spacing:
  card-sm: '12px'
  card: '16px'
  band-x: '20px'
  band-y: '12px'
components:
  button-primary:
    backgroundColor: '{colors.neutral-primary}'
    textColor: '{colors.card-white}'
    rounded: '{rounded.lg}'
    typography: '{typography.body}'
    height: '32px'
    padding: '0 10px'
  button-outline:
    backgroundColor: '{colors.card-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '32px'
    padding: '0 10px'
  button-ghost:
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '32px'
    padding: '0 10px'
  button-donate:
    backgroundColor: '{colors.signal-brick}'
    textColor: '{colors.card-white}'
    rounded: '{rounded.md}'
  input:
    backgroundColor: '{colors.card-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '32px'
    padding: '4px 10px'
  card:
    backgroundColor: '{colors.card-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '{spacing.card}'
  badge:
    rounded: '{rounded.md}'
    typography: '{typography.label}'
    padding: '2px 6px'
  sidebar:
    backgroundColor: '{colors.depot-charcoal}'
    textColor: '{colors.sidebar-text}'
  sidebar-item-active:
    backgroundColor: '{colors.depot-charcoal-raised}'
    textColor: '{colors.card-white}'
  line-header-band:
    backgroundColor: '{colors.line-red}'
    textColor: '{colors.card-white}'
    typography: '{typography.page-title}'
    padding: '12px 20px'
---

# Design System: TransitMatters Data Dashboard

## Overview

**Creative North Star: "The Station Platform Board"**

The dashboard works like the information board on a T platform. It is public, civic, and plain. Its job is to tell you, honestly and at a glance, how the line is running. The chrome stays neutral (a charcoal TransitMatters sidebar, white cards on a pale stone ground, system type) so the meaning comes from two places only: the official MBTA line colors, which say _which line_, and a small set of status shapes, which say _how it's doing_. Nothing on the screen is ornamental. When a page needs color, the line provides it.

The mood is civic, plain, and trustworthy. This is a working tool for advocates and reporters that everyday riders can still read. Density is moderate: cards hold one chart or one ledger each, and figures use tabular numerals so they line up and can be quoted exactly. The brand shows up in a few precise places: the TM wordmark, the charcoal nav, and Signal Brick red on the donate actions and the CIP banner.

Each line page puts on its line's colors. A `data-line` attribute re-themes `--primary`, `--ring`, `--accent`, and `--chart-1` to that line's color, so buttons, focus rings, chart series, and status nodes all match the line being viewed, and the header band across the top is filled with it.

**Key Characteristics:**

- A neutral shell, with the line color as the one strong hue on any page.
- Status is carried by shape (filled, starred, open ring, dashed "!"), never by color alone.
- Flat surfaces separated by tone and a 1px hairline ring.
- System font stack, with tabular numerals for every figure.
- A charcoal sidebar that stays charcoal in both light and dark mode.

## Colors

The palette is a neutral grey shell with two brand colors (Signal Brick and Depot Charcoal), plus the official MBTA line colors, which are the system's working accents.

### Primary

- **Signal Brick** (`signal-brick`): The TransitMatters brand red. It is for brand and support moments only: the Donate button, the donate callout, the CIP banner, and the trendline legend marker. It never marks a line (the Red Line has its own color) and never signals an error.
- **Depot Charcoal** (`depot-charcoal`): The warm charcoal of the sidebar nav, behind the white TM wordmark. It stays this color in dark mode too; the shadcn neutral dark sidebar is deliberately overridden. **Depot Charcoal Raised** (`depot-charcoal-raised`) is its hover/active fill and border.

### Line colors (the working accents)

- **Red Line / Mattapan** (`line-red`), **Orange Line** (`line-orange`), **Blue Line** (`line-blue`), **Green Line** (`line-green`), **Bus** (`line-bus`), **Silver Line** (`line-silver`), **Commuter Rail** (`line-commuter-rail`), **Ferry** (`line-ferry`).
- They fill the header band on line pages, color chart series, tint the route bullet and status nodes, and become `--primary` inside a `data-line` scope. Each has light and dark variants in `tailwind.config.js` (`mbta.lightRed`, `mbta.darkRed`, and so on) for chart fills and hover states.
- Text on Orange, Bus, and Silver is near-black (`oklch(0.205 0 0)`), not white. White fails contrast on those three.

### Neutral

- **Stone Ground** (`stone-ground`): The page background behind the cards (`bg-stone-100`).
- **Card White** (`card-white`): Card, popover, and input surfaces.
- **Ink** (`ink`): Body text and headings.
- **Ink Muted** (`ink-muted`): Subtitles, captions, axis labels, legend text, and "not measured" states.
- **Hairline** (`hairline`): Borders, input strokes, and dividers.
- **Quiet Fill** (`quiet-fill`): Hover fills, the tab track, secondary buttons, and card footers.
- **Neutral Primary** (`neutral-primary`): The default button fill outside a line scope.
- **Destructive** (`destructive`): Errors and the "Needs work" status text, always alongside the dashed "!" node.

Status text tones come from Tailwind's own scale: green-700 for Good and Win, amber-700 for Room to grow, and the destructive red for Needs work. Each is always paired with its shape.

### Named Rules

**The One Line Color Rule.** A page shows at most one line's color as its accent: the line being viewed. A multi-line view (the system pages, the homepage) shows each line's color only on that line's own bullet, row, or series, and never as a page-wide accent.

**The Brick Is for Brand Rule.** Signal Brick marks TransitMatters itself (donations, announcements). Don't use it for errors, alerts, or the Red Line.

**The Legacy Variables Rule.** `:root` still defines older `--red-line`, `--bus`, and `--transitmatters-red` values that differ from the tokens above. They are legacy. New work uses the `mbta.*` and `tm.*` Tailwind colors or the `data-line` theme variables.

## Typography

**Body Font:** The system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, …, 'Helvetica Neue', sans-serif`), used for everything.
**Label/Mono Font:** None in general use. Figures use the body font with tabular numerals.

**Character:** The type is native and unbranded on purpose, so it reads like the device's own information display. Hierarchy comes from weight and size, not from a display face.

### Hierarchy

- **Page Title** (`page-title`): The header band's `<h1>`. The line name is bold and the page name is regular weight, separated by a route bullet ("**Red Line** • Travel Times").
- **Title** (`title`): Card titles. When a card title links to a page, it takes the line's text color and a trailing chevron.
- **Body** (`body`): The default size for card content, table cells, and menu items. Card subtitles are 13px in Ink Muted.
- **Figure** (`figure`): Every metric value. Semibold with `tabular-nums`, so columns of numbers align and can be quoted.
- **Label** (`label`): Badges, legends, and the status legend.
- **Status Caption** (`status-caption`): The word under a status node ("Good", "Needs work"), in its status tone.

Larger sizes (`text-2xl` to `text-4xl`) appear only for hero stats on overview pages.

### Named Rules

**The Tabular Figures Rule.** Any number a reader might compare or quote is set with `tabular-nums`. Proportional numerals in a column of data count as a bug.

## Layout

The app shell is a collapsible sidebar (icon-collapsed on desktop, a sheet on mobile) beside a `SidebarInset` main column on Stone Ground. Content is capped at 1200px (`.main-column`) and centered.

Line pages stack three things: a sticky line-colored header band (20px horizontal, 12px vertical padding) holding the title and the date/station controls, an optional control bar under it, and a grid of cards. Cards pad 16px (12px for the `sm` size) on every side, and children inside a card inherit that padding instead of adding their own.

Spacing follows Tailwind's 4px scale. Breakpoints are Tailwind's defaults (640 / 768 / 1024 / 1280 / 1536px) and are shared with runtime code through `common/constants/breakpoints.js`. Charts switch to a chart-plus-side-legend grid at 770px and above. On phones, card headers stack the title above the actions, and scoreboard stops switch from columns to rows.

Every view is addressable: line, page, dates, and filters live in the URL search params, so any layout state can be shared as a link.

## Elevation & Depth

The system is flat and ring-defined. Cards sit directly on Stone Ground with no shadow, separated by the change in tone and a 1px ring of 10% ink (`ring-1 ring-foreground/10`). Shadows are reserved for things that float over content: the sticky header band (`shadow-md`), popovers and menus (`shadow-md` / `shadow-lg`, each also ringed), and the tapped/selected states of legacy data boxes (inset shadows).

### Shadow Vocabulary

- **Floating band** (`shadow-md`): The sticky line header, so content scrolling under it reads as passing beneath.
- **Overlay** (`shadow-md`, `shadow-lg` for submenus): Popovers, dropdowns, and the command palette.
- **Pressed** (`box-shadow: inset 1px 1px 4px rgba(0,0,0,0.2)`): Legacy tapped data boxes and selected line toggles. Don't extend this to new components.

### Named Rules

**The Flat-at-Rest Rule.** A surface that sits in the page flow has no shadow. Only a surface that floats over other content (it is sticky, overlaid, or anchored to a trigger) gets one.

## Shapes

Corners are gently rounded from a single `--radius` of 10px, which scales out to the steps in the frontmatter: 6px for small controls, 8px for badges and xs buttons, 10px for buttons, inputs, popovers, and the tab track, and 14px for cards. Circles are reserved for meaning: route bullets, status nodes, and legend dots. A circle in this system is always a stop on a line or a line's identity, so don't use one for decoration or avatars.

Borders are hairlines: 1px in Hairline, or a 10% ink ring on raised surfaces. The status nodes are the one place where border style carries meaning. A solid 3px ring means room to grow, a dashed 2px ring means needs work, and a faint ring with a 45° hatch means not enough data.

## Components

### Buttons

Quiet and compact, built for a dense tool.

- **Shape:** Gently rounded (10px), 32px tall by default; sizes run from 24px (`xs`) to 36px (`lg`), with square icon variants.
- **Primary:** Filled with `--primary`. That's Neutral Primary outside a line, and the line's color inside a `data-line` scope, with the line's correct foreground. Hover drops it to 80% opacity.
- **Outline / Secondary / Ghost:** Outline is white with a hairline border, Secondary is Quiet Fill, and Ghost has no fill until hover. All three hover to Quiet Fill.
- **Focus:** The border takes the ring color, plus a 3px ring at 50% (`focus-visible:ring-3 ring-ring/50`). Inside a line scope the ring is the line's color.
- **Press:** Moves down 1px (`active:translate-y-px`).
- **Donate:** The one Signal Brick button. It sits in the sidebar footer and inverts to white with brick text on hover.

### Chips / Badges

- **Style:** 8px radius, 12px medium text, 2px × 6px padding.
- **Variants:** Default (`--primary`), Secondary, Outline, and three status tints: Success (green-100 / green-800), Warning (amber-100 / amber-800), and Destructive (destructive at 10%).
- **Use:** Status pills ("Strong", "Room to grow", "Needs work"), headline verdicts, and stat deltas. A status pill is always worded; its tint backs up the word and never replaces it.

### Cards / Containers

- **Corner Style:** 14px.
- **Background:** Card White on Stone Ground.
- **Shadow Strategy:** None. A 1px ring of 10% ink (see Elevation & Depth).
- **Internal Padding:** 16px (12px in the `sm` size). The chart card (`Widget`) adds the same value horizontally, so children line up without their own padding.
- **Header:** Title, an optional 13px muted subtitle, and an optional action slot. Actions wrap below the title on phones and sit at the right on desktop.
- **Loading and error:** A card waits behind a chart placeholder. A chart that throws shows an error notice with retry, and resets when the route or filters change.

### Inputs / Fields

- **Style:** 32px tall, 10px radius, hairline border, transparent fill (white on cards).
- **Focus:** The same ring as buttons. The `@tailwindcss/forms` blue focus ring is explicitly cleared for shadcn inputs.
- **Error / Disabled:** `aria-invalid` gives a destructive border and ring. Disabled is 50% opacity on a faint fill.

### Tabs / Segmented Toggles

- **Style:** A Quiet Fill track (10px radius, 3px inset) with a white pill that slides between triggers (250ms, `cubic-bezier(0.22, 1, 0.36, 1)`), rather than each trigger snapping.
- **Line variant:** Transparent with an underline, for in-card view switches.

### Navigation

- **Sidebar:** Depot Charcoal, with the white TM wordmark at the top, then the command-palette trigger, the system pages, and the line list (each line with its route bullet). Items hover and activate to Depot Charcoal Raised. It collapses to icons on desktop and becomes a sheet on mobile, which closes on navigation.
- **Line header band:** A sticky, full-width band filled with the current line's color (`stone-800` when no line is selected), holding the page title and the date controls. Text color follows the line: white on Red, Blue, Green, Commuter Rail, and Ferry; near-black on Orange, Bus, and Silver.

### Status Node (signature)

The strip-map stop that carries a metric's verdict by shape, drawn in the current text color (the line's color via `text-primary`). It is 20px in the scoreboard and 16px in the legend.

- **Win:** a filled circle with a white star and a soft 4px halo of the line color at 20%.
- **Good:** a filled circle.
- **Room to grow:** an open 3px ring.
- **Needs work:** a dashed 2px ring with a bold "!".
- **Not enough data:** a faint ring with a 45° hatch.
- **Not measured:** a short muted dash.

The node is decorative (`aria-hidden`). A worded status caption or an accessible label always says the same thing.

### Route Bullet

A small filled circle (10 / 14 / 16px) in the line's color. It identifies a line in nav rows, scoreboard rows, and the header title. Use it sparingly, only to say _which_ line.

### Motion

- **Arrival (`.tm-reveal`):** Rows that carry fresh data rise 8px and fade in over 420ms, staggered 60ms apart (`--reveal-index`), so a list arrives one stop at a time.
- **Fill-in (`.tm-fade-in`):** A value replacing its placeholder fades in over 200ms without moving.
- **Overlays:** Open in 250ms and close in 150ms on `cubic-bezier(0.22, 1, 0.36, 1)`.
- All of these are disabled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:

- **Do** theme any line-specific surface by setting `data-line` on its container and using `--primary` / `text-primary`. Don't hard-code the line's hex.
- **Do** pair every status color with a shape (status node) or a word (status pill or caption). Status must read without color.
- **Do** set every figure in `tabular-nums`, semibold, and show how fresh the data is.
- **Do** use near-black text on Orange, Bus, and Silver fills, and white on the rest.
- **Do** build on the shadcn primitives in `common/components/ui/` and the `Widget` / `WidgetDiv` card. Don't hand-roll a new card look.
- **Do** keep cards flat on Stone Ground with the 10% ink ring, and keep shadows for floating surfaces.
- **Do** keep the Depot Charcoal sidebar and white wordmark on every page, in both themes.

### Don't:

- **Don't** introduce a new visual world, typeface, or palette for a new surface. New surfaces extend this system.
- **Don't** use Signal Brick for errors, alerts, or the Red Line.
- **Don't** show more than one line's color as a page-wide accent.
- **Don't** use circles decoratively. Circles mean stops and lines here.
- **Don't** add shadows to in-flow cards or extend the legacy inset "pressed" shadows to new components.
- **Don't** use the legacy `:root` line variables (`--red-line`, `--bus`, `--transitmatters-red`) in new code.
- **Don't** add motion that ignores `prefers-reduced-motion`, or animate a value in a way that moves it under the reader.
