# Scroll Animations Guide (Slide-Up + Fade)

## ✅ What's Been Implemented

### 1. CSS Animations
- **Location**: `src/index.css`
- **Animations**:
  - `slideUp` - Slides element up 30px while fading in
  - `.scroll-animate` - Default animation (0.6s duration)
  - `.scroll-animate-fast` - Faster animation for lists (0.4s duration)
- **Accessibility**: Automatically disabled for `prefers-reduced-motion` users

### 2. Custom Hook: `useScrollAnimation`
- **Location**: `src/hooks/useScrollAnimation.ts`
- **Purpose**: Trigger animations when elements enter viewport
- **Features**:
  - Intersection Observer based
  - Configurable threshold and delays
  - Trigger once or repeatedly
  - Respects reduced motion preferences

### 3. Wrapper Component: `AnimatedSection`
- **Location**: `src/components/shared/AnimatedSection.tsx`
- **Purpose**: Easy-to-use wrapper for adding animations
- **Benefits**:
  - No need to manage refs manually
  - Cleaner component code
  - Consistent animation patterns

### 4. Dashboard Implementation
- **Location**: `src/pages/DashboardPage.tsx`
- **Sections with animations**:
  - Portfolio Hero (0ms delay)
  - Performance Chart (100ms delay)
  - Stats Row (150ms delay)
  - Charts (200ms delay)
  - Summary (250ms delay)
  - Assets List (300ms delay)

---

## 🎯 How to Use

### Method 1: Using the `AnimatedSection` Component (Recommended)

```tsx
import { AnimatedSection } from '@/components/shared/AnimatedSection';

function MyComponent() {
  return (
    <AnimatedSection>
      <div className="card">
        This card will slide up and fade in when scrolled into view
      </div>
    </AnimatedSection>
  );
}
```

### Method 2: Using the Hook Directly

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`scroll-animate ${isVisible ? 'scroll-animate-visible' : ''}`}
    >
      My content
    </div>
  );
}
```

### Method 3: Staggered List Animations

```tsx
import { useStaggeredAnimation } from '@/hooks/useScrollAnimation';

function MyList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <ListItem key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

function ListItem({ item, index }) {
  const { ref, isVisible } = useStaggeredAnimation(index, 50); // 50ms delay per item

  return (
    <div
      ref={ref}
      className={`scroll-animate-fast ${isVisible ? 'scroll-animate-fast-visible' : ''}`}
    >
      {item.name}
    </div>
  );
}
```

---

## 📋 Advanced Examples

### Custom Animation Delay

```tsx
<AnimatedSection animationOptions={{ delay: 200 }}>
  <MyCard />
</AnimatedSection>
```

### Custom Threshold (% of element visible before triggering)

```tsx
<AnimatedSection animationOptions={{ threshold: 0.5 }}>
  {/* Triggers when 50% of element is visible */}
  <MyCard />
</AnimatedSection>
```

### Trigger Animation Every Time (not just once)

```tsx
<AnimatedSection animationOptions={{ triggerOnce: false }}>
  <MyCard />
</AnimatedSection>
```

### Fast Animation for List Items

```tsx
<AnimatedSection fast>
  <ListItem />
</AnimatedSection>
```

### Using Different HTML Element

```tsx
<AnimatedSection as="section" id="my-section">
  <MyContent />
</AnimatedSection>
```

---

## 🎨 Animation Timing Reference

| Component Type | Duration | Delay Strategy | Use Case |
|---|---|---|---|
| **Hero Sections** | 0.6s | 0ms | Main focus, appears first |
| **Cards/Panels** | 0.6s | 100-300ms | Secondary content |
| **List Items** | 0.4s | 50ms × index | Multiple items |
| **Charts** | 0.6s | 200-300ms | Data visualizations |
| **Form Sections** | 0.6s | 100-200ms | Input groups |

---

## 🧪 Testing Your Animations

### Manual Testing

1. **Start dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **View dashboard**:
   - Open http://localhost:5173
   - Scroll down the page
   - Each section should slide up and fade in as you scroll

3. **Test reduced motion**:
   - Enable "Reduce Motion" in OS settings
   - Refresh page
   - All elements should appear instantly (no animation)

### Visual Indicators

Elements will:
1. Start invisible and shifted 30px down
2. Animate to visible and original position when in viewport
3. Take 0.6s for normal elements, 0.4s for list items

---

## 📐 CSS Classes Reference

### Base Classes

```css
/* Hidden state */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
}

/* Animated state */
.scroll-animate-visible {
  animation: slideUp 0.6s ease-out forwards;
}

/* Fast variant */
.scroll-animate-fast {
  opacity: 0;
  transform: translateY(20px);
}

.scroll-animate-fast-visible {
  animation: slideUp 0.4s ease-out forwards;
}
```

### Custom Animations

You can create your own by following the pattern:

```css
@keyframes myCustomAnimation {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.my-custom-animate-visible {
  animation: myCustomAnimation 0.8s ease-out forwards;
}
```

---

## 🎭 Real-World Examples

### Example 1: Animated Cards Grid

```tsx
function FeaturesGrid() {
  const features = [
    { id: 1, title: "Feature 1", description: "..." },
    { id: 2, title: "Feature 2", description: "..." },
    { id: 3, title: "Feature 3", description: "..." },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((feature, index) => (
        <AnimatedSection
          key={feature.id}
          animationOptions={{ delay: index * 100 }}
        >
          <div className="card p-6">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
```

### Example 2: Form with Staggered Fields

```tsx
function AnimatedForm() {
  const fields = [
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'message', label: 'Message' },
  ];

  return (
    <form>
      {fields.map((field, index) => (
        <AnimatedSection
          key={field.name}
          animationOptions={{ delay: index * 80 }}
          fast
        >
          <div className="mb-4">
            <label>{field.label}</label>
            <input name={field.name} />
          </div>
        </AnimatedSection>
      ))}
    </form>
  );
}
```

### Example 3: Stats Row with Sequential Animation

```tsx
function StatsRow() {
  const stats = [
    { label: 'Total Assets', value: '$1.2M' },
    { label: 'Total Gain', value: '+15.3%' },
    { label: 'Best Performer', value: 'AAPL' },
  ];

  return (
    <div className="flex gap-6">
      {stats.map((stat, index) => (
        <AnimatedSection
          key={stat.label}
          animationOptions={{ delay: index * 100 }}
          className="flex-1"
        >
          <div className="card p-4 text-center">
            <p className="text-sm text-text-muted">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
```

---

## ⚡ Performance Tips

### 1. Use `will-change` Sparingly

Only add `will-change` to elements that are currently animating:

```tsx
const { ref, isVisible } = useScrollAnimation();

<div
  ref={ref}
  className={`scroll-animate ${isVisible ? 'scroll-animate-visible' : ''}`}
  style={isVisible ? { willChange: 'transform, opacity' } : undefined}
>
  Content
</div>
```

### 2. Limit Simultaneous Animations

Don't animate more than 10-15 elements at once. Use stagger delays to spread them out.

### 3. Reduce Animations on Low-End Devices

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEndDevice = navigator.hardwareConcurrency <= 2;

const shouldAnimate = !prefersReducedMotion && !isLowEndDevice;
```

---

## ♿ Accessibility

### Automatic Reduced Motion Support

The `useScrollAnimation` hook automatically detects and respects the user's motion preferences:

```tsx
// In useScrollAnimation.ts
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  setIsVisible(true); // Show immediately, no animation
  return;
}
```

### CSS Fallback

The CSS also includes a global fallback:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🐛 Troubleshooting

### Animations not triggering?

1. Check that element is outside viewport on page load
2. Verify `threshold` is appropriate (default 0.1 = 10%)
3. Check browser console for errors
4. Ensure element has height (can't observe 0-height elements)

### Animations too fast/slow?

Adjust duration in CSS:

```css
.scroll-animate-visible {
  animation: slideUp 1s ease-out forwards; /* Slower */
}
```

### Elements flash before animating?

Make sure initial state is set:

```tsx
<div className="scroll-animate"> {/* Important! */}
  Content
</div>
```

---

## 🚀 Summary

✅ Slide-up + fade animations implemented
✅ Custom hook for scroll-triggered animations
✅ Wrapper component for easy integration
✅ Staggered animations for lists
✅ Accessibility compliant (reduced motion)
✅ Performance optimized (Intersection Observer)
✅ Dashboard sections animated with delays

**All major dashboard sections now animate smoothly as you scroll!**

Test it by scrolling through your dashboard - each section should slide up and fade in beautifully.
