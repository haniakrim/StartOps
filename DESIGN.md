# Expo Design System

Extracted from https://expo.dev

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--expo-black` | `#000000` | Primary text, dark backgrounds |
| `--expo-white` | `#FFFFFF` | Light backgrounds, text on dark |
| `--expo-gray-50` | `#F5F5F7` | Subtle backgrounds |
| `--expo-gray-100` | `#E5E5EA` | Borders, dividers |
| `--expo-gray-200` | `#D1D1D6` | Disabled states |
| `--expo-gray-300` | `#C7C7CC` | Placeholder text |
| `--expo-gray-400` | `#8E8E93` | Secondary text |
| `--expo-gray-500` | `#636366` | Muted text |
| `--expo-gray-600` | `#48484A` | Body text |
| `--expo-gray-700` | `#3A3A3C` | Strong text |
| `--expo-gray-800` | `#2C2C2E` | Headings |
| `--expo-gray-900` | `#1C1C1E` | Deep backgrounds |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--expo-blue` | `#007AFF` | Primary actions, links |
| `--expo-blue-light` | `#5AC8FA` | Secondary accent |
| `--expo-indigo` | `#5856D6` | Tertiary accent |
| `--expo-purple` | `#AF52DE` | Highlights |
| `--expo-pink` | `#FF2D55` | Destructive, badges |
| `--expo-orange` | `#FF9500` | Warnings |
| `--expo-yellow` | `#FFCC00` | Caution |
| `--expo-green` | `#34C759` | Success |
| `--expo-teal` | `#5AC8FA` | Info |

### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--expo-dark-bg` | `#000000` | Page background |
| `--expo-dark-surface` | `#1C1C1E` | Card backgrounds |
| `--expo-dark-elevated` | `#2C2C2E` | Elevated surfaces |
| `--expo-dark-border` | `#38383A` | Borders |

## Typography

### Font Family
- Primary: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif`
- Mono: `'SF Mono', SFMono-Regular, ui-monospace, monospace`

### Scale
| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `display` | 64px | 700 | 1.1 | -0.02em |
| `h1` | 48px | 700 | 1.15 | -0.02em |
| `h2` | 36px | 600 | 1.2 | -0.015em |
| `h3` | 28px | 600 | 1.25 | -0.01em |
| `h4` | 22px | 600 | 1.3 | -0.005em |
| `body-large` | 18px | 400 | 1.5 | 0 |
| `body` | 16px | 400 | 1.5 | 0 |
| `body-small` | 14px | 400 | 1.5 | 0 |
| `caption` | 12px | 500 | 1.4 | 0.01em |
| `overline` | 11px | 600 | 1.2 | 0.05em |

## Spacing

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

## Border Radius

| Token | Value |
|-------|-------|
| `radius-sm` | 6px |
| `radius-md` | 10px |
| `radius-lg` | 14px |
| `radius-xl` | 20px |
| `radius-full` | 9999px |

## Shadows

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `shadow-lg` | `0 12px 40px rgba(0,0,0,0.12)` |
| `shadow-xl` | `0 24px 60px rgba(0,0,0,0.16)` |

## Components

### Buttons
- Primary: `bg-expo-blue text-white rounded-lg px-5 py-2.5 font-medium`
- Secondary: `bg-expo-gray-50 text-expo-gray-900 rounded-lg px-5 py-2.5 font-medium border border-expo-gray-100`
- Ghost: `bg-transparent text-expo-blue rounded-lg px-5 py-2.5 font-medium`

### Cards
- Default: `bg-white dark:bg-expo-dark-surface rounded-xl border border-expo-gray-100 dark:border-expo-dark-border shadow-sm`
- Elevated: `bg-white dark:bg-expo-dark-elevated rounded-xl shadow-md`

### Inputs
- Default: `bg-white dark:bg-expo-dark-surface border border-expo-gray-200 dark:border-expo-dark-border rounded-lg px-4 py-2.5 text-expo-gray-900 dark:text-white placeholder:text-expo-gray-400`

## Animation

| Token | Duration | Easing |
|-------|----------|--------|
| `duration-fast` | 150ms | ease-out |
| `duration-normal` | 250ms | ease-out |
| `duration-slow` | 350ms | ease-out |
| `spring` | 500ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
