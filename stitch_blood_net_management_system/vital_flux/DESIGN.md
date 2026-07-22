---
name: Vital Flux
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5c403c'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00682b'
  on-tertiary: '#ffffff'
  tertiary-container: '#008438'
  on-tertiary-container: '#e7ffe4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
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
    letterSpacing: -0.02em
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
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered to foster trust, urgency, and clinical precision for blood donation and management. The brand personality is "Reliably Human"—balancing the high-stakes nature of medical logistics with the warmth of community-driven donation. 

The aesthetic follows a **Modern Corporate** style with **Minimalist** and **Glassmorphic** accents. It prioritizes clarity and speed of use, ensuring that critical data (blood types, inventory levels, donor records) is never obscured by decorative elements. The UI should feel airy and professional, utilizing generous whitespace to reduce cognitive load during high-pressure medical workflows.

## Colors
The palette is rooted in medical standards, utilizing a vibrant **Medical Red** as the primary action color to signify life and urgency. **Blue** is used for secondary information and navigation to provide a calming, professional counterbalance. 

- **Primary (#DC2626):** Reserved for core "Life-saving" actions, blood type indicators, and critical CTAs.
- **Surface (#FFFFFF):** Used for all primary containers to ensure high contrast against the subtle **Background (#F8FAFC)**.
- **Success/Warning/Danger:** Strictly reserved for status indicators (e.g., Inventory levels, Screening results).

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-dense interfaces and its neutral, systematic character. 

- **Display & Headlines:** Use tight letter-spacing (-0.02em) for a modern, "Stripe-like" appearance.
- **Labels:** Use Medium (500) or Semi-bold (600) weights for metadata to distinguish it from body text.
- **Scale:** Maintain a clear hierarchy where titles are significantly more prominent than body text to assist in rapid scanning of medical records.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density spacing for dashboards and generous padding for donor-facing forms.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Breakpoints:** Mobile (< 640px), Tablet (640px - 1024px), Desktop (> 1024px).
- **Rhythm:** Use an 8px base unit for all component spacing. Dashboard widgets should use 24px internal padding to maintain the "Vercel" inspired clean aesthetic.

## Elevation & Depth
Depth is achieved through a combination of **Tonal Layers** and **Ambient Shadows**. 

1. **Level 0 (Background):** #F8FAFC - The canvas.
2. **Level 1 (Cards/Widgets):** #FFFFFF - Uses a soft, multi-layered shadow (0px 1px 3px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.05)).
3. **Level 2 (Overlays/Dropdowns):** Glassmorphism effect. Use `backdrop-filter: blur(8px)` with a semi-transparent white background (rgba(255, 255, 255, 0.8)) and a 1px subtle border.

## Shapes
The shape language is friendly yet structured. While standard components use **Rounded (0.5rem)** corners, cards and major containers utilize an exaggerated **2xl (1.5rem)** radius to align with modern SaaS trends.

- **Small Components (Buttons/Inputs):** 8px (rounded-md).
- **Medium Components (Dropdowns/Modals):** 12px (rounded-xl).
- **Large Components (Dashboard Cards/Containers):** 24px (rounded-3xl).

## Components
Consistent styling across the system is achieved through these patterns:

- **Buttons:** Solid Primary Red for main actions. Secondary buttons use a subtle ghost style with a gray-200 border. Use 12px vertical and 20px horizontal padding.
- **Cards:** White background, 24px padding, 24px border-radius, and the Level 1 shadow defined in Elevation.
- **Input Fields:** 1px border (#E2E8F0), 12px padding. On focus, use a 2px Blue (#2563EB) ring with 0.2 opacity.
- **Chips/Badges:** For blood types (e.g., A+, O-), use a "Pill" shape (999px radius) with a light tinted background and bold text of the same color (e.g., Red-50 bg with Red-600 text).
- **Lists:** Clean rows with 1px bottom dividers (#F1F5F9). High-density for dashboard lists, low-density for donor history.
- **Iconography:** Use **Lucide** icons. Maintain a consistent 20px size for UI icons and 24px for feature icons. Line weight should be 2px (Regular).