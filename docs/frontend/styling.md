# Styling & Theming

The application uses Tailwind CSS 3.4 with extensive custom configuration for MBTA transit colors and design tokens.

## MBTA Color Palette

### Transit Line Colors

Colors are defined in two places: Tailwind config for CSS classes and `common/constants/colors.ts` for JavaScript access.

| Line | Tailwind Class | Hex | CSS Variable |
|------|---------------|-----|-------------|
| Red Line | `bg-mbta-red` | `#D13434` | — |
| Orange Line | `bg-mbta-orange` | `#ed8b00` | — |
| Blue Line | `bg-mbta-blue` | `#003da5` | — |
| Green Line | `bg-mbta-green` | `#00834d` | — |
| Mattapan | `bg-mbta-mattapan` | `#D13434` | Same as Red |
| Bus | `bg-mbta-bus` | `#FFC72C` | — |
| Commuter Rail | `bg-mbta-commuterRail` | `#80276c` | — |
| Ferry | `bg-mbta-ferry` | `#008EAA` | — |
| The RIDE | `bg-mbta-theRide` | `#FFC72C` | Same as Bus |

Each line also has `light` and `dark` variants available (e.g., `bg-mbta-lightRed`, `bg-mbta-darkRed`).

### Color Intensity Levels

For charts that need multiple shades of a line color, `LINE_COLORS_LEVELS` provides 4 intensity levels (0 = darkest, 3 = lightest):

```typescript
LINE_COLORS_LEVELS = {
  'line-red': { 0: '#D13434', 1: '#d64949', 2: '#da5e5e', 3: '#df7272' },
  'line-orange': { 0: '#ed8b00', 1: '#ff9907', 2: '#ffa321', 3: '#ffae3b' },
  // ... etc
}
```

### Chart Colors

```typescript
CHART_COLORS = {
  GREY: '#1c1c1c',
  BLUE: '#0096FF',
  GREEN: '#64b96a',
  YELLOW: '#f5ed00',
  RED: '#c33149',
  PURPLE: '#bb5cc1',
  FILL: '#bfc8d680',        // Semi-transparent fill
  FILL_HOURLY: '#88aee680', // Hourly chart fill
  DARK_LINE: '#303030a0',
  ANNOTATIONS: 'rgba(32,32,32,0.4)',
  BLOCKS: 'rgba(32,32,32,0.2)',
}
```

### Design System Colors

```typescript
COLORS.design = {
  darkGrey: '#353535',
  sideBar: '#403e3e',
  subtitleGrey: '#808080',
  lightGrey: '#DADADA',
  background: '#F6F6F6',
}
```

---

## Tailwind Configuration

**File**: `tailwind.config.js`

### Key Customizations

#### Safelist
Dynamic line color classes are safelisted to prevent purging:

```javascript
safelist: [
  {
    pattern: /(border|text|bg)-mbta-(red|lightRed|darkRed|orange|...)/,
  },
]
```

#### Custom Animations

- Star movement animations (`star-movement-top`, `star-movement-bottom`) — used in the `StarBorder` component

#### Custom Box Shadows

| Name | Use |
|------|-----|
| `figma` | Figma-style elevation |
| `dataBox` | Data display cards |
| `selectedLine` | Active line indicator |
| `illuminate` | Glow effect |
| `shadowUp` | Upward shadow |

#### Custom Text Shadows

A custom Tailwind plugin adds `text-shadow` utilities:

```css
.text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.text-shadow    { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.text-shadow-lg { text-shadow: 0 8px 16px rgba(0,0,0,0.1); }
```

#### Font

Display font family: **Helvetica Neue**.

---

## Dark Mode

Dark mode is enabled with the `class` strategy:

```javascript
// tailwind.config.js
darkMode: 'class'
```

This means dark mode is activated by adding the `dark` class to a parent element, rather than using the OS preference.

---

## Responsive Design

The application uses:

1. **Tailwind breakpoints** — standard `sm`, `md`, `lg`, `xl` responsive utilities
2. **Separate component variants** — `DesktopHeader` / `MobileHeader`, `ControlPanel` / `MobileControlPanel`, etc.
3. **`useBreakpoint()` hook** — programmatic breakpoint detection for conditional rendering

---

## CSS Architecture

| File | Purpose |
|------|---------|
| `styles/globals.css` | Global styles, Tailwind directives |
| `tailwind.config.js` | Theme, colors, plugins |
| `postcss.config.js` | PostCSS with Tailwind + Autoprefixer |

### Plugins

| Plugin | Purpose |
|--------|---------|
| `@tailwindcss/forms` | Form element styling |
| `flowbite` | UI component styles |
| `prettier-plugin-tailwindcss` | Auto-sort Tailwind classes |
| Custom text-shadow plugin | `text-shadow` utilities |

---

## Prettier Integration

Tailwind classes are automatically sorted by Prettier:

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

This ensures consistent class ordering across the codebase.
