# Vibe Design System Styling Guide

**Version:** 1.0.0 (Vibe Migration Complete)
**Last Updated:** 2026-02-19
**Target Audience:** Frontend developers working with React components

## Overview

TrendVault frontend uses the **Vibe Design System** (`@vibe/core` v3.85.1 + `@vibe/icons` v1.16.0) for all visual design. Tailwind CSS is retained for **structural layout only** (flexbox, grid, spacing, sizing, responsive breakpoints). All color, typography, border, shadow, and semantic styling is handled via Vibe CSS custom properties.

### Design System Architecture

```
@vibe/core
├── tokens (CSS custom properties)
│   ├── Text: --primary-text-color, --secondary-text-color, etc.
│   ├── Background: --primary-background-color, --allgrey-background-color, etc.
│   ├── Semantic: --positive-color, --negative-color, --warning-color
│   ├── Named: --color-working_orange, --color-purple, --color-sofia_pink
│   ├── Typography: --font-h1-bold through --font-text3-normal
│   ├── Borders: --ui-border-color, --layout-border-color
│   ├── Shadows: --box-shadow-xs, --box-shadow-small, --box-shadow-medium
│   └── Border Radius: --border-radius-small, --border-radius-medium
└── components (React component library)
    ├── Icon (SVG wrapper)
    ├── Button
    ├── Loader
    └── ... (other Vibe components)

@vibe/icons
└── Prebuilt SVG icon components (Sun, Moon, Alert, Retry, etc.)

Tailwind CSS (v4)
└── Layout utilities only
    ├── flex, grid, gap
    ├── px, py, m (spacing)
    ├── w, h (sizing)
    ├── sm, md, lg, xl (responsive breakpoints)
    └── ... (layout-only utilities)
```

## Token Reference

### Text Colors

| Token                      | Usage                                      | Example                                          |
| -------------------------- | ------------------------------------------ | ------------------------------------------------ |
| `--primary-text-color`     | Primary foreground (headings, body text)   | `style={{ color: 'var(--primary-text-color)' }}` |
| `--secondary-text-color`   | Secondary foreground (descriptions, hints) | Subheadings, explanatory text                    |
| `--disabled-text-color`    | Disabled state text                        | Form inputs, disabled buttons                    |
| `--text-color-on-primary`  | High-contrast text on primary surfaces     | Alert messages                                   |
| `--text-color-on-inverted` | Text on inverted backgrounds               | Dark surfaces in light mode                      |
| `--link-color`             | Hyperlink text                             | `<a>` tags, navigation links                     |

### Background Colors

| Token                              | Usage                                    | Example                            |
| ---------------------------------- | ---------------------------------------- | ---------------------------------- |
| `--primary-background-color`       | Main surface (cards, panels, containers) | Page backgrounds, modals           |
| `--secondary-background-color`     | Secondary surface (nested sections)      | Sidebar, dropdown backgrounds      |
| `--allgrey-background-color`       | Neutral grey surface                     | Input fields, disabled states      |
| `--primary-background-hover-color` | Hover state background                   | Button hover, interactive elements |

### Semantic Colors

| Token                       | Usage                                | Example                        |
| --------------------------- | ------------------------------------ | ------------------------------ |
| `--positive-color`          | Success, confirmation, green         | Check marks, success alerts    |
| `--negative-color`          | Error, destructive, red              | Error messages, delete actions |
| `--warning-color`           | Caution, orange                      | Warning alerts, pending states |
| `--positive-color-selected` | Selected positive state (background) | Highlighted success badge      |
| `--negative-color-selected` | Selected negative state (background) | Highlighted error badge        |
| `--warning-color-selected`  | Selected warning state (background)  | Highlighted warning badge      |

### Platform Brand Colors

These colors are **hardcoded hex values** (not CSS variables) to maintain platform branding:

| Platform  | Color | Hex       | Usage                           |
| --------- | ----- | --------- | ------------------------------- |
| YouTube   | Red   | `#FF0000` | YouTube video cards, branding   |
| TikTok    | Black | `#000000` | TikTok video cards, branding    |
| Instagram | Pink  | `#E1306C` | Instagram video cards, branding |

**Example:**

```typescript
style={{ borderColor: '#FF0000' }} // YouTube accent
```

### Named Colors (Brand Extended Palette)

| Token                    | Usage                                 |
| ------------------------ | ------------------------------------- |
| `--color-working_orange` | Accent highlights, interactive states |
| `--color-purple`         | Secondary accent, interactive states  |
| `--color-sofia_pink`     | Tertiary accent, interactive states   |
| `-selected` variants     | Selected states (background fill)     |

**Example:**

```typescript
style={{
  color: 'var(--color-working_orange)',
  backgroundColor: 'var(--color-working_orange-selected)',
}}
```

### Typography

Vibe typography tokens are **font shorthand** (font-size + weight + line-height):

| Token                 | Level        | Example Usage       |
| --------------------- | ------------ | ------------------- |
| `--font-h1-bold`      | Heading 1    | Page title          |
| `--font-h2-bold`      | Heading 2    | Section heading     |
| `--font-h3-bold`      | Heading 3    | Subsection heading  |
| `--font-text1-bold`   | Body bold    | Strong emphasis     |
| `--font-text2-normal` | Body regular | General text        |
| `--font-text3-normal` | Small text   | Helper text, labels |

**Usage Pattern:**

```typescript
style={{ font: 'var(--font-h2-bold)' }}
style={{ font: 'var(--font-text2-normal)' }}
```

### Borders

| Token                   | Value        | Usage                                         |
| ----------------------- | ------------ | --------------------------------------------- |
| `--ui-border-color`     | Light grey   | Interactive elements (buttons, inputs, cards) |
| `--layout-border-color` | Lighter grey | Layout dividers, structural borders           |

### Shadows

| Token                 | Value                  | Usage                          |
| --------------------- | ---------------------- | ------------------------------ |
| `--box-shadow-xs`     | Small elevation        | Subtle depth                   |
| `--box-shadow-small`  | Small-medium elevation | Dropdown menus, tooltips       |
| `--box-shadow-medium` | Medium elevation       | Modal dialogs, prominent cards |

### Border Radius

| Token                    | Value | Usage                                  |
| ------------------------ | ----- | -------------------------------------- |
| `--border-radius-small`  | 4-6px | Slightly rounded inputs, small buttons |
| `--border-radius-medium` | 8px   | Standard components, cards             |

## Styling Patterns

### Pattern 1: Inline Styles with CSS Variables

Use `style={{}}` prop for Vibe token application:

```typescript
// Text styling
<h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
  Page Title
</h1>

// Surface styling
<div style={{
  backgroundColor: 'var(--primary-background-color)',
  borderColor: 'var(--ui-border-color)',
  boxShadow: 'var(--box-shadow-medium)',
  borderRadius: 'var(--border-radius-medium)',
  border: '1px solid',
}}>
  Content here
</div>
```

### Pattern 2: Utility Classes for Common Patterns

Use CSS utility classes in `/styles/vibe-overrides.css` for edge cases:

```typescript
// Instead of style={{ color: 'var(--primary-text-color)' }}
<div className="text-primary">Text</div>

// Available utilities:
.text-primary         // --primary-text-color
.text-secondary       // --secondary-text-color
.text-disabled        // --disabled-text-color
.surface-primary      // background: --primary-background-color
.surface-hover        // background: --primary-background-hover-color
.border-ui            // border-color: --ui-border-color
```

### Pattern 3: Hover States with Event Handlers

Use `onMouseEnter` and `onMouseLeave` for interactive hover effects (CSS hover pseudo-classes don't work with CSS variables in inline styles):

```typescript
<button
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
      'var(--primary-background-hover-color)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
  }}
  style={{ backgroundColor: 'transparent' }}
>
  Hover me
</button>
```

### Pattern 4: Conditional Styling

Use ternary operators for state-based styles:

```typescript
style={{
  color: isActive ? 'var(--primary-color)' : 'var(--primary-text-color)',
  backgroundColor: isActive ? 'var(--primary-selected-color)' : 'transparent',
}}
```

### Pattern 5: Theme-Aware Chart Colors

Use the `useVibeColors()` hook for chart libraries (Recharts) that require hex values:

```typescript
import { useVibeColors } from '@/hooks/use-vibe-colors';

export function MyChart() {
  const colors = useVibeColors();

  return (
    <LineChart data={data}>
      <Line stroke={colors.textPrimary} />
      <Bar fill={colors.positive} />
    </LineChart>
  );
}
```

The hook automatically re-reads CSS variables when the theme changes.

### Pattern 6: Tailwind + Vibe Combination

Combine Tailwind for layout, Vibe tokens for styling:

```typescript
<div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6">
  {/* Tailwind: flex, flex-col, gap, padding, responsive breakpoints */}
  <div
    className="rounded-lg border overflow-hidden"
    style={{
      backgroundColor: 'var(--primary-background-color)',
      borderColor: 'var(--ui-border-color)',
    }}
  >
    {/* Vibe tokens: colors, borders */}
    Content
  </div>
</div>
```

## Implementation Examples

### Example: Interactive Button

```typescript
import { useState } from 'react';

export function InteractiveButton({ label, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--border-radius-medium)',
        border: '1px solid var(--ui-border-color)',
        backgroundColor: isHovered
          ? 'var(--primary-background-hover-color)'
          : 'var(--primary-background-color)',
        color: 'var(--primary-text-color)',
        font: 'var(--font-text2-normal)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}
```

### Example: Card Component

```typescript
export function VibeCard({ title, description, children }) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--ui-border-color)',
        boxShadow: 'var(--box-shadow-small)',
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--layout-border-color)' }}>
        <h3 style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}>
          {title}
        </h3>
        {description && (
          <p style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
```

### Example: Status Badge

```typescript
export function StatusBadge({ status }) {
  const statusConfig = {
    success: {
      bgColor: 'var(--positive-color-selected)',
      textColor: 'var(--positive-color)',
    },
    error: {
      bgColor: 'var(--negative-color-selected)',
      textColor: 'var(--negative-color)',
    },
    warning: {
      bgColor: 'var(--warning-color-selected)',
      textColor: 'var(--warning-color)',
    },
  };

  const config = statusConfig[status] || statusConfig.warning;

  return (
    <span
      className="inline-block rounded-full px-3 py-1"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        font: 'var(--font-text3-normal)',
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

## Theme Switching

The Vibe Design System supports light, dark, and system themes via `@vibe/core` ThemeProvider:

```typescript
// In app.tsx
import { ThemeProvider } from '@vibe/core';
import { useThemeStore } from '@/stores/theme-store';

export default function App() {
  const { theme } = useThemeStore();

  return (
    <ThemeProvider theme={theme}>
      <YourAppContent />
    </ThemeProvider>
  );
}
```

All CSS variables automatically switch values when theme changes. Components using `useVibeColors()` hook re-compute to reflect new theme.

## Migration Notes (Tailwind → Vibe)

### What Was Replaced

| Old Approach                                            | New Approach                                     |
| ------------------------------------------------------- | ------------------------------------------------ |
| Tailwind color classes (`text-blue-500`, `bg-gray-100`) | Vibe CSS variables (`var(--primary-text-color)`) |
| Tailwind shadow classes (`shadow-md`)                   | Vibe shadow tokens (`var(--box-shadow-medium)`)  |
| Tailwind border classes (`border-gray-200`)             | Vibe border tokens (`var(--ui-border-color)`)    |
| Tailwind typography classes (`text-xl`, `font-bold`)    | Vibe font tokens (`var(--font-h2-bold)`)         |
| CSS :hover pseudo-class                                 | `onMouseEnter`/`onMouseLeave` event handlers     |

### What Remains (Tailwind)

- Layout: `flex`, `grid`, `gap`, `mx`, `my`, `px`, `py`
- Sizing: `w`, `h`, `min-w`, `max-w`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Other structural: `overflow`, `rounded`, `border` (without color)

## Best Practices

1. **Always use CSS variables for colors** - Never hardcode color hex except for platform branding
2. **Semantic colors first** - Use `--positive-color` instead of `--color-working_orange` for status
3. **Group related styles** - Combine text + background + border in one `style={{}}` object
4. **Prefer utility classes for repeated patterns** - Add to `vibe-overrides.css` if used 3+ times
5. **Test theme switching** - Toggle dark mode to verify all styles remain readable
6. **Document hardcoded colors** - Platform branding colors should have comments
7. **Use `useVibeColors()` for chart libraries** - Never hardcode chart colors

## File Organization

```
apps/web/src/
├── styles/
│   ├── vibe-overrides.css       # Utility classes for CSS vars
│   └── index.css                # Global resets, @tailwind directives
├── hooks/
│   └── use-vibe-colors.ts       # Read Vibe tokens as hex for charts
├── components/
│   ├── ui/                      # Reusable components (vibe-card, badges, etc.)
│   ├── layout/                  # App layout (header, sidebar, theme toggle)
│   └── icons/                   # Custom SVG icons (supplementing @vibe/icons)
├── pages/                       # Page components using Vibe tokens
└── main.tsx                     # Vibe tokens import order
```

## Import Order (Critical)

In `main.tsx`, maintain this exact import order:

```typescript
import '@vibe/core/tokens'; // 1. Vibe tokens (CSS variables)
import './styles/vibe-overrides.css'; // 2. Utility classes over-ride
import App from './app';
import './index.css'; // 3. Global resets after Vibe
```

Incorrect order will cause CSS specificity issues.

## Debugging

### Check Available Tokens

In browser DevTools console:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
// Output: #1a1a1a
```

### Verify Theme Application

```javascript
document.documentElement.getAttribute('data-vibe-theme');
// Output: 'light' | 'dark' | 'system'
```

### Common Issues

| Issue                                          | Cause                                  | Solution                                                |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| Colors don't change on theme toggle            | Component not re-rendering             | Add `theme` dep to `useEffect` or use `useVibeColors()` |
| CSS var shows as `--var-name` instead of color | Missing `@vibe/core/tokens` import     | Verify import order in `main.tsx`                       |
| Hover state not working                        | Using CSS `:hover` pseudo-class        | Use `onMouseEnter`/`onMouseLeave` handlers              |
| Chart colors are wrong                         | Recharts can't resolve CSS vars in SVG | Use `useVibeColors()` to extract hex values             |

## Resources

- **Vibe Documentation:** Consult `@vibe/core` package docs
- **Icon Library:** Browse `@vibe/icons` available icons
- **Theme Store:** See `stores/theme-store.ts` for theme management
- **Example Components:** Check `components/layout/theme-toggle.tsx` for best practices
- **Styling Reference:** See `styles/vibe-overrides.css` for utility class patterns
