---
name: Kinetic Sync
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
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#d7dff9'
  on-secondary-container: '#5a6278'
  tertiary: '#00432c'
  on-tertiary: '#ffffff'
  tertiary-container: '#215b42'
  on-tertiary-container: '#95d1b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#382abf'
  secondary-fixed: '#dae2fc'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3e465b'
  tertiary-fixed: '#b3f0cf'
  tertiary-fixed-dim: '#98d3b4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#135038'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-sm:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 280px
  max-content-width: 1200px
---

## Brand & Style
Kinetic Sync is a high-performance workspace platform designed for engineering and product teams who require clarity amidst high-velocity communication. The brand personality is **Technical, Focused, and Efficient**, evoking a sense of calm productivity.

The visual style is **Corporate Modern with Glassmorphic touches**. It utilizes a systematic "Canvas" approach where content is organized in a structured bento-grid layout. Depth is achieved through subtle tonal layering and backdrop-blur effects on persistent navigation elements, ensuring the interface feels premium and lightweight rather than dense.

## Colors
The palette is anchored by a deep **Indigo Primary (#2a14b4)**, representing stability and technical precision. The background uses a very light **Cool Slate (#f8fafc)** to reduce eye strain during long working sessions. 

Functional color logic:
- **Primary:** Used for high-emphasis actions, active states, and brand identifiers.
- **Surface Tiers:** Uses a multi-step grey scale (Low to Highest) to define component boundaries without relying on heavy borders.
- **Accents:** Tertiary greens are used for events and scheduling, while Error reds are reserved for urgent notifications and unread counts.

## Typography
The system uses a dual-font pairing to balance technicality with readability. **Geist** is used for headlines and functional labels to provide a precise, developer-centric feel. **Inter** is utilized for body copy and messaging threads, ensuring maximum legibility for long-form text.

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual hierarchy.
- **Labels:** Small Geist labels are used for metadata, buttons, and navigation, often in all-caps or medium weights for clarity.
- **Mobile Scaling:** Display-sm should scale to Headline-md (24px) on mobile devices to preserve vertical space.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation is anchored by a fixed left sidebar (280px), while the main content area utilizes a 12-column grid that expands up to a maximum width of 1200px.

- **Margins & Gutters:** A standard 24px (lg) margin is used for page edges and between major bento cards.
- **Internal Padding:** Components use a 16px (md) internal padding to maintain a breathable but information-dense layout.
- **Responsive Behavior:** On tablet, the sidebar collapses into a drawer. On mobile, the bento grid reflows to a single column (span 12) with reduced 16px page margins.

## Elevation & Depth
Elevation is primarily expressed through **Tonal Layers** and **Subtle Shadows**. 

- **Level 0 (Base):** Background color #F8FAFC.
- **Level 1 (Cards):** Surface-container-lowest (#ffffff) with a 2px diffuse shadow (rgba(0,0,0,0.05)) and a 1px outline-variant border.
- **Persistent Layers:** The Top Navigation Bar uses a Glassmorphic effect (80% opacity with 12px backdrop-blur) to maintain context of the content scrolling beneath it.
- **Interactive Depth:** Hover states on cards should transition the border color to a 30% primary tint rather than increasing shadow depth, keeping the UI feeling flat and fast.

## Shapes
The shape language is **Soft and Systematic**. 

- **Standard Elements:** Buttons and small containers use a 4px (0.25rem) radius.
- **Large Containers:** Content cards and sections use an 8px (0.5rem) radius (rounded-lg).
- **Interactive Controls:** Search bars and decorative tags (like "Filter") use 24px (full) pill-shaped rounding to distinguish them from structural layout elements.
- **Iconography:** Use Material Symbols with a weight of 400 and a default size of 20px for sidebar actions and 18px for inline actions.

## Components
### Buttons
- **Primary:** High-contrast Indigo background with white text. 4px radius.
- **Ghost/Tertiary:** No background, primary text, used for secondary actions like "View All".
- **Icon Buttons:** Circular 32px or 40px hit targets with subtle hover backgrounds (surface-variant).

### Cards
- **Bento Cards:** White background, 1px outline-variant border, 8px radius. 
- **Inner Room Cards:** Use a secondary background (surface-bright) on hover with a decorative gradient accent in the top corner.

### Inputs
- **Search:** Pill-shaped, surface-container-low background, no border. Focus state adds a 2px primary/50 ring.

### Navigation
- **Sidebar Links:** High-contrast active state with a 4px solid primary right-border. Hover state uses surface-variant with a subtle 95% scale-down active effect.
- **Top Nav Tabs:** Simple text-based navigation with a 2px bottom-border indicating the active route.

### Status Indicators
- **Badges:** Small, highly rounded (pill) with bold colors (Error Red) for unread counts, placed in the top-right corner of list items.