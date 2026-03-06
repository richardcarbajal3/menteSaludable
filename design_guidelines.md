# MentalCare Companion - Design Guidelines

## Design Approach

**Reference-Based Approach** drawing from mental health and wellness leaders:
- **Calm & Headspace**: Soothing color palettes, gentle animations, emotional design
- **Apple Health**: Clear data visualization, trustworthy interface
- **Notion**: Organized content structure, intuitive navigation
- **Principle**: Create a safe, warm digital space that feels professional yet comforting - never clinical or judgmental

---

## Color Palette

### Light Mode
- **Primary**: 220 65% 55% (Soft blue - trust and calm)
- **Primary Hover**: 220 70% 48%
- **Background**: 210 20% 98% (Soft off-white)
- **Surface**: 0 0% 100% (Pure white cards)
- **Text Primary**: 220 15% 20%
- **Text Secondary**: 220 10% 45%
- **Accent Warm**: 25 85% 60% (Gentle coral - encouragement)
- **Success**: 145 60% 50% (Calming green)

### Dark Mode
- **Primary**: 220 60% 65%
- **Primary Hover**: 220 65% 58%
- **Background**: 220 15% 10% (Deep navy-black)
- **Surface**: 220 12% 15% (Elevated cards)
- **Text Primary**: 210 15% 95%
- **Text Secondary**: 210 10% 70%
- **Accent Warm**: 25 75% 65%
- **Success**: 145 50% 55%

### Emotion Color System
- **Happy/Joy**: 50 90% 60% (Warm yellow-gold)
- **Calm/Peace**: 200 70% 65% (Soft blue)
- **Anxious/Worried**: 280 50% 65% (Gentle purple)
- **Sad/Down**: 210 40% 50% (Muted blue-gray)
- **Neutral**: 0 0% 60% (Soft gray)

---

## Typography

**Font Stack**: 'Inter' (primary), 'SF Pro Display' (headings), system fallbacks

### Hierarchy
- **Hero/Dashboard Welcome**: text-4xl font-light (48px, 300 weight)
- **Section Headers**: text-2xl font-semibold (24px, 600 weight)
- **Card Titles**: text-lg font-medium (18px, 500 weight)
- **Body Text**: text-base font-normal (16px, 400 weight)
- **Captions/Meta**: text-sm font-normal (14px, 400 weight)
- **Micro-copy**: text-xs (12px) for timestamps, hints

---

## Layout System

**Spacing Units**: Consistent rhythm using 4, 6, 8, 12, 16, 24 (p-4, p-6, p-8, gap-12, py-16, py-24)

### Structure
- **Max Container Width**: max-w-7xl for dashboard, max-w-4xl for journal/forms
- **Card Padding**: p-6 on mobile, p-8 on desktop
- **Section Spacing**: py-16 for mobile, py-24 for desktop
- **Grid Gaps**: gap-6 for cards, gap-4 for lists

---

## Core Components

### Dashboard Cards
- **Mood Summary Card**: Large card with current mood emoji, last 7 days mini-chart, gentle gradient background
- **Quick Actions**: 3-column grid (md:grid-cols-3) with icon + label, soft hover states
- **Progress Visualization**: Horizontal bar charts with rounded corners (rounded-full), gradient fills

### Emotion Selector (Registro de Estado de Ánimo)
- **Layout**: Grid of emotion buttons (grid-cols-3 md:grid-cols-5)
- **Buttons**: Circular (aspect-square), emoji/icon centered, label below, scale transform on hover
- **Selected State**: Ring-4 with primary color, subtle shadow-lg
- **Comment Box**: Textarea with min-h-32, soft border, focus:ring-2

### Resource Library Cards
- **Card Design**: White/dark surface, rounded-2xl, shadow-sm hover:shadow-md transition
- **Layout**: Each card has icon badge (top-left), title, duration/category tag, completion checkbox
- **Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- **Categories**: Pill-shaped filters with border, active state with filled background

### Journal/Notes Interface
- **Entry List**: Timeline-style with date markers on left, entries on right
- **Editor**: Clean textarea with generous padding (p-6), focus state with subtle glow
- **Save Button**: Prominent, primary color, right-aligned with icon

### Navigation
- **Top Bar**: Sticky nav with logo left, profile/settings right, glass-morphism effect (backdrop-blur-md)
- **Mobile**: Bottom tab bar with 4 main sections (Home, Mood, Resources, Journal)
- **Desktop**: Sidebar navigation with icons + labels, collapsible

---

## Interaction Patterns

### Micro-interactions
- **Button Press**: Scale-95 on active, smooth transition-all duration-200
- **Card Hover**: Lift effect with shadow-md and translate-y-1
- **Completed Items**: Checkmark animation with scale-in, subtle green glow
- **Loading States**: Skeleton screens with shimmer effect, pulse animation

### Data Visualization
- **Mood Chart**: Line/area chart with gradient fill, rounded corners on bars
- **Streak Counter**: Animated number increment, celebration confetti on milestones
- **Progress Rings**: Circular progress with gradient stroke, percentage in center

---

## Images & Visual Assets

**Icons**: Heroicons (outline for inactive, solid for active states)

### Image Usage
- **No Hero Image**: This app focuses on immediate utility, not marketing
- **Avatar/Profile**: Circular user photo placeholder (bg-gradient)
- **Resource Thumbnails**: Soft illustrations for meditation/exercise cards (use placeholder with category colors)
- **Empty States**: Friendly illustrations with encouraging messages

---

## Accessibility & Emotional Safety

- **Consistent Dark Mode**: Full implementation including inputs, modals, all surfaces
- **Color Contrast**: WCAG AAA for all text, minimum 7:1 ratio
- **Emotion Colors**: Accompanied by icons and text labels, never rely on color alone
- **Focus States**: Prominent ring-2 focus indicators, keyboard navigation throughout
- **Gentle Language**: All UI copy is supportive, never commanding (e.g., "How are you feeling?" not "Log your mood")
- **No Harsh Red**: Avoid alarm-red for errors, use soft amber/orange with helpful guidance

---

## Responsive Behavior

- **Mobile First**: Touch-friendly targets (min 44px), generous spacing
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- **Dashboard**: Stack cards vertically on mobile, 2-column on tablet, 3-column on desktop
- **Navigation**: Bottom tabs on mobile, sidebar on desktop (lg:)

---

## Animation Philosophy

**Principle**: Minimal, purposeful animations that reinforce calmness
- **Page Transitions**: Gentle fade-in (opacity 0→1, 300ms)
- **Mood Selection**: Subtle scale feedback (scale-105), no bouncing
- **Success States**: Soft checkmark draw animation, brief celebration
- **Avoid**: Auto-playing animations, distracting movements, anything anxiety-inducing