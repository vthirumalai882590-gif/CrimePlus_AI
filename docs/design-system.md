# CrimePulse AI — Design System

This document locks the UI design tokens, styling rules, and layout constraints for the CrimePulse AI command intelligence platform. **All developers and AI subagents must strictly adhere to this specification.**

---

## 1. Visual Philosophy
CrimePulse AI is a **command-intelligence grade tactical tool**, modeled after systems like Palantir Gotham, ArcGIS Public Safety, and Bloomberg Terminal.
* **Density Over Whitespace**: Maximum information density. Avoid empty space, large marketing margins, and card padding.
* **Functional Color**: Color must carry tactical meaning (status, alert tiers, heat indicators). Do not use decorative gradients, ambient glows, or colors without functional definitions.
* **No Glassmorphism or AI-Slop Templates**: No purple/violet neon glows. No translucent backdrop filters. No unstyled shadcn defaults. All surfaces are solid, dark, and highly readable.
* **Actionable Visual Hierarchy**: Important alerts pulse, KPI counts count up, and risk grids show desaturated density bands.

---

## 2. Color Palette

All colors are defined as CSS variables in `tokens.css`.

| Variable | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--bg-base` | `#070B19` | Main screen background |
| `--bg-surface` | `#0E1626` | Card, sidebar, list, and form backgrounds |
| `--bg-surface-elevated` | `#172033` | Hovered cards, dropdown options |
| `--border-subtle` | `#1E293B` | Default borders separating panels |
| `--border-accent` | `#334155` | Borders of selected elements or headers |
| `--text-primary` | `#F8FAFC` | Titles, values, body text |
| `--text-secondary` | `#94A3B8` | Subtitles, labels, secondary headers |
| `--text-muted` | `#64748B` | Disabled states, placeholders, table column labels |
| `--color-accent` | `#38BDF8` | Primary interface highlight (sky blue) |
| `--color-accent-hover` | `#7DD3FC` | Hover state for accent buttons |
| `--severity-low` | `#10B981` | Safe/Normal tier indicators (emerald) |
| `--severity-medium` | `#F59E0B` | Watch-tier warning alerts (amber) |
| `--severity-high` | `#EF4444` | Urgent tactical alerts (crimson) |

---

## 3. Typography & Monospacing

* **Primary Font**: Sans-serif, geometric, and authoritative (`Segoe UI`, `-apple-system`, `BlinkMacSystemFont`, `Roboto`, `sans-serif`).
* **Data Font (Monospace)**: Numeric labels, date tables, latitude/longitude, and case counts must use a monospaced font family to prevent text jitter during updates.
  * Font Stack: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`.

```css
.numeric-data {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

---

## 4. UI Grid & Panel Anatomy

The dashboard maintains a fixed viewport layout, mimicking a tactical control center display.

* **Layout Structure**:
  * **Sidebar (240px)**: Collapsible, flat border, holds navigation, language toggles, and role context switcher.
  * **Top Filter Bar (40px)**: Compact inline selector for District, Station, Date Range, and Severity.
  * **Main Viewport**: Auto-fitting grids, scrollable components, or map view.
* **Card Anatomy**:
  * Borders: `1px solid var(--border-subtle)`
  * Border Radius: `2px` (sharp, military-grade corners; avoid round pill shapes)
  * Background: `var(--bg-surface)`
  * Header: Thin top border or simple underline, dark slate backing.
