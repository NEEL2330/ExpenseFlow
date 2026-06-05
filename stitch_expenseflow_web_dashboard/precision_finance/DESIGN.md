---
name: Precision Finance
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for high-performance financial management, prioritizing clarity, trust, and data density. The aesthetic is **Corporate / Modern**, leaning into a sophisticated fintech look that balances professional reliability with modern agility. 

The target audience consists of professionals and small business owners who require an organized, efficient, and data-driven environment. The UI should evoke a sense of calm control, reducing the cognitive load associated with complex financial data through generous whitespace, a structured grid, and a purposeful use of color to highlight actionable insights.

## Colors

The palette is anchored by **Deep Navy (#0F172A)** for primary text and high-level navigation, ensuring an immediate sense of authority. **Action Blue (#2563EB)** serves as the primary interaction color, while **Emerald Green (#10B981)** is reserved for positive financial trends and success states.

Surfaces utilize a range of off-whites and cool grays to differentiate between content containers and the background. Chart colors are specifically chosen for high contrast and accessibility, ensuring data visualizations remain legible at various scales.

## Typography

**Inter** is the workhorse of this design system, chosen for its exceptional legibility in data-heavy interfaces. It scales across nine distinct levels to create a clear information hierarchy. 

A specialized **Data Mono (JetBrains Mono)** style is introduced for numerical values, transaction IDs, and currency displays. This ensures that columns of numbers align perfectly in tables, facilitating quick scanning and comparison of financial figures. Use `label-caps` for small metadata or section headers within sidebars.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for the main content area, paired with a fixed-width sidebar for primary navigation. 

- **Sidebar:** Fixed at 280px for desktop, collapsible to 80px (icons only), and hidden behind a hamburger menu on mobile.
- **Rhythm:** An 8px linear scale (with a 4px half-step for tight components) governs all padding and margins. 
- **Margins:** Desktop views use 40px outer margins to provide "breathing room" for dense data, while mobile scales down to 16px to maximize screen real estate.

## Elevation & Depth

This system uses **Tonal Layers** as the primary method of depth, supplemented by **Ambient Shadows** for interactive elements.

- **Level 0 (Background):** The base canvas uses the neutral background color (#F8FAFC).
- **Level 1 (Cards/Sidebar):** White surfaces with a subtle 1px border (#E2E8F0).
- **Level 2 (Overlays/Dropdowns):** Elevated surfaces with a soft, diffused shadow: `0px 4px 12px rgba(15, 23, 42, 0.08)`.

Avoid high-contrast shadows or heavy blurs. The goal is a "flat plus" look where depth serves to separate logical containers rather than simulate physical objects.

## Shapes

The shape language is consistently **Rounded (Level 2)**. Standard UI elements like buttons, input fields, and tags use a 0.5rem (8px) radius. Larger containers, such as dashboard cards and modals, utilize `rounded-lg` (16px) or `rounded-xl` (24px) to soften the professional aesthetic and make the application feel modern and approachable.

## Components

### Navigation & Sidebar
The sidebar is the architectural spine. Active states should use a vertical 4px bar on the left in Action Blue, with a subtle light blue background tint. Navigation items should use `body-sm` with medium weight.

### Buttons
- **Primary:** Action Blue background, white text, 8px corner radius. Heavyweight 600 Inter.
- **Secondary:** Transparent background, Action Blue border and text. 
- **Tertiary/Ghost:** No background or border, Deep Navy text. Used for less frequent actions like "Cancel."

### Input Fields
Inputs should have a 1px border (#CBD5E1) that transitions to Action Blue on focus. Labels sit outside the input field using `label-caps` for clarity. Use `data-mono` for currency inputs.

### Cards
Dashboard cards are the primary container for data. They feature a white background, 16px corner radius, and a light border. Padding within cards should be a consistent 24px (spacing-lg).

### Chips & Status Indicators
Status chips use a "light-on-light" pattern: a very pale background version of the status color with high-contrast text (e.g., light green background with dark green text for "Paid").

### Data Tables
Tables are the most critical component. Use a 1px horizontal-only border style. Rows should have a subtle hover state (#F1F5F9). Headers use `label-caps` with a light gray text color to de-emphasize them relative to the transaction data.