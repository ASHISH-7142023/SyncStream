---
name: Obsidian Flux
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  mono-label:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The brand identity is built on a foundation of "Obsidian Digitalism"—a high-fidelity, futuristic aesthetic designed for high-performance collaboration. It targets developers, creative teams, and tech-forward organizations who value speed, precision, and a sophisticated workspace.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**, set against a deep, dark environment. It utilizes vibrant neon accents to provide functional "energy" within the UI. The emotional response is one of focus, technical mastery, and seamless flow. Key characteristics include:
- **Depth through Translucency:** Using frosted glass effects to establish a sense of layers.
- **Neon Utility:** Colors are used specifically for status, action, and category differentiation, never for mere decoration.
- **Precision Typography:** A technical, clean font choice that emphasizes clarity in high-density data environments.

## Colors

The palette is optimized for OLED and high-resolution displays, featuring an "Obsidian" base with a spectrum of neon accents.

- **Base Atmosphere:** The core background is `#020617`, providing maximum contrast for the vibrant accents.
- **Primary Action:** A tech-blue/purple (`#6366F1`) serves as the primary call-to-action color.
- **Neon Accents:** 
    - **Cyan (`#06B6D4`):** Used for technology-related indicators and successful states.
    - **Purple (`#A855F7`):** Used for design, creative threads, and special badges.
    - **Orange (`#F97316`):** Used for alerts, warnings, and room-specific identifiers.
    - **Green (`#22C55E`):** Specifically for online presence and validated success.
- **Glass Surfaces:** Containers use semi-transparent fills with subtle borders to create a layered workspace without heavy solid backgrounds.

## Typography

This design system uses **Geist** exclusively. Its technical precision and excellent legibility in dark environments make it the ideal choice for a tool that requires both long-form reading (chat) and rapid scanning (dashboards).

- **Headlines:** Use tighter letter spacing and heavier weights to maintain a strong presence against dark backgrounds.
- **Body Text:** Optimized with a 1.5x–1.6x line height to prevent "bleeding" of white text on dark surfaces.
- **Labels:** Small labels utilize a medium weight and slight tracking to ensure they remain distinct at small scales (e.g., timestamps, member counts).
- **Mobile Scaling:** For mobile devices, `display-xl` should scale down to 32px, and all horizontal padding should increase to maintain comfortable reading widths.

## Layout & Spacing

The layout utilizes a **Fluid Grid** model within a structured shell. 

- **Workspace Shell:** A fixed-width sidebar (240px–280px) remains constant, while the primary content area stretches to fill the viewport.
- **Spacing Scale:** A 4px base unit ensures mathematical harmony. Use `16px (md)` for standard component padding and `24px (lg)` for sectional separation.
- **Column Logic:** Dashboard views use a 12-column grid. Chat and feed views center the content within a max-width container (960px) to maintain readability on ultra-wide monitors.
- **Breakpoints:**
    - **Mobile (<768px):** Sidebars collapse into a "hamburger" or bottom-nav model. Margins reduce to 16px.
    - **Tablet (768px - 1024px):** Sidebars become iconic (64px) to maximize content space.
    - **Desktop (>1024px):** Full expanded navigation and multi-pane views (Chat + Member List).

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Base):** Obsidian (`#020617`). This is the bottom-most canvas.
- **Level 1 (Panels):** Sidebar and secondary navigation panes use a slightly lighter tint or a very low-opacity glass effect (3%–5% white overlay).
- **Level 2 (Cards/Modals):** These use the `surface_glass` token. They feature a 1px border (`rgba(255, 255, 255, 0.1)`) to define the shape against the dark background.
- **Level 3 (Popovers/Tooltips):** Floating elements use a more opaque background and a diffused "Glow" shadow that inherits the color of the underlying primary accent (e.g., a subtle purple glow for a purple-themed tooltip).
- **Backdrop Blurs:** Any surface elevated above Level 1 must apply a `blur(12px)` to maintain legibility of the text over the content below.

## Shapes

The shape language is "Softly Geometric." Elements are rounded enough to feel approachable and modern, but sharp enough to maintain a professional, tool-like appearance.

- **Standard Elements:** Buttons, inputs, and small cards use the `0.5rem (8px)` roundedness.
- **Large Containers:** Main content panels and modals use `1rem (16px)` to create a distinct frame.
- **Avatar/Status:** Always use circular (pill-shaped) masks.
- **Interactive States:** On hover, certain interactive tiles may transition from a subtle border to a more defined "glow" edge, but the corner radius remains constant to prevent layout shifts.

## Components

### Buttons
- **Primary:** Solid gradient or solid primary color with white/high-contrast text. Rounded (8px).
- **Secondary/Ghost:** Transparent background with a 1px border. Hover state adds a 10% white overlay.
- **Icon Buttons:** No background by default; circular hover background.

### Input Fields
- **Container:** Darker than the surface background with a subtle inner glow or 1px border.
- **Focus State:** Border color changes to Primary (`#6366F1`) with a 2px outer glow.
- **Icons:** Leading icons for search or data type; trailing icons for validation (checkmarks/warning).

### Cards & Modules
- **Design:** Use the `surface_glass` style.
- **Padding:** Standardized at 24px for dashboard cards, 16px for sidebar items.
- **Headers:** Use `mono-label` for small metadata headings within cards.

### Chat & Messaging
- **Messages:** Grouped by user within a time-window. Hovering over a message reveals a floating reaction bar.
- **Mentions:** Highlighted with a low-opacity background tint matching the primary color and a bold font weight.

### Chips & Badges
- **Status Chips:** Small, pill-shaped, using high-saturation background at 15% opacity with 100% opacity text for the label.
- **Room Indicators:** Use the tertiary/quaternary color scale to categorize rooms (e.g., `#` icon color).