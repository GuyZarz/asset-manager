# Smooth Scroll Implementation Guide

## ✅ What's Been Implemented

### 1. Global Smooth Scroll Behavior
- **Location**: `src/index.css`
- **CSS Applied**: `scroll-behavior: smooth` on the `<html>` element
- **Accessibility**: Automatically respects `prefers-reduced-motion` preference

### 2. Custom Hook: `useSmoothScroll`
- **Location**: `src/hooks/useSmoothScroll.ts`
- **Purpose**: Programmatically scroll to elements with smooth animation
- **Features**:
  - Scroll to any element by ID, selector, or element reference
  - Configurable offset (useful for sticky headers)
  - Respects user's motion preferences

### 3. Scroll to Top Button
- **Location**: `src/components/shared/ScrollToTop.tsx`
- **Behavior**:
  - Appears when user scrolls down 300px
  - Smoothly scrolls back to top when clicked
  - Positioned in bottom-right corner (above mobile tabs)

### 4. Dashboard Sections
- **Location**: `src/pages/DashboardPage.tsx`
- **Section IDs Added**:
  - `#dashboard-top` - Page header
  - `#portfolio-overview` - Portfolio hero section
  - `#performance` - Performance chart
  - `#stats` - Stats row
  - `#charts` - Allocation and gain/loss charts
  - `#summary` - Asset type summary
  - `#assets` - Asset list

---

## 🎯 How to Use

### Using Anchor Links (Automatic)

Any anchor link will now scroll smoothly:

```tsx
// Simple anchor link
<a href="#portfolio-overview">View Portfolio</a>

// React Router Link with hash
<Link to="/#charts">See Charts</Link>
```

### Using the `useSmoothScroll` Hook

```tsx
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

function MyComponent() {
  const { scrollTo, scrollToTop } = useSmoothScroll();

  const handleScrollToAssets = () => {
    scrollTo({
      target: '#assets',
      offset: 80 // Account for sticky header (80px)
    });
  };

  const handleScrollToElement = () => {
    const element = document.querySelector('.my-class');
    scrollTo({
      target: element,
      offset: 100
    });
  };

  return (
    <>
      <button onClick={handleScrollToAssets}>
        Jump to Assets
      </button>
      <button onClick={scrollToTop}>
        Back to Top
      </button>
    </>
  );
}
```

### Adding Scroll to Top Button to Other Pages

```tsx
import { ScrollToTop } from '@/components/shared/ScrollToTop';

export function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <ScrollToTop />
    </div>
  );
}
```

---

## 📋 Examples

### Quick Navigation Menu (Example)

```tsx
function QuickNav() {
  return (
    <nav className="flex gap-4 text-sm">
      <a
        href="#portfolio-overview"
        className="text-accent hover:underline"
      >
        Portfolio
      </a>
      <a
        href="#charts"
        className="text-accent hover:underline"
      >
        Charts
      </a>
      <a
        href="#assets"
        className="text-accent hover:underline"
      >
        Assets
      </a>
    </nav>
  );
}
```

### Programmatic Scroll After Action

```tsx
function AssetForm() {
  const { scrollTo } = useSmoothScroll();

  const handleSubmit = async (data) => {
    await saveAsset(data);

    // Scroll to the asset list after saving
    scrollTo({ target: '#assets', offset: 80 });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎨 Customization

### Adjusting Scroll Offset

The offset parameter accounts for fixed/sticky headers:

```tsx
scrollTo({
  target: '#my-section',
  offset: 80 // Header height in pixels
});
```

### Changing Scroll Behavior

```tsx
scrollTo({
  target: '#my-section',
  behavior: 'auto' // Instant scroll (no animation)
});
```

### Styling the Scroll to Top Button

Edit `src/components/shared/ScrollToTop.tsx`:

```tsx
// Change appearance threshold
if (window.pageYOffset > 500) { // Show after 500px instead of 300px

// Change position
className="fixed bottom-8 left-4 ..." // Bottom-left instead of bottom-right

// Change color
className="... bg-purple-600 ..." // Purple instead of accent color
```

---

## ♿ Accessibility Features

### Automatic Motion Reduction

Users who have enabled "Reduce Motion" in their OS settings will see instant scrolling instead of smooth animation.

**Test this**:
- **Windows**: Settings → Accessibility → Visual effects → Animation effects (OFF)
- **macOS**: System Preferences → Accessibility → Display → Reduce motion
- **Browser DevTools**: Chrome → Rendering → Emulate CSS media → prefers-reduced-motion

### Screen Reader Support

All scroll functionality includes proper ARIA labels:

```tsx
<button
  onClick={scrollToTop}
  aria-label="Scroll to top"
>
  ↑
</button>
```

---

## 🧪 Testing

### Manual Testing

1. **Test smooth scroll**:
   - Scroll down the dashboard
   - Click the "Scroll to Top" button (bottom-right)
   - Should smoothly scroll to top

2. **Test anchor links**:
   - Create a link: `<a href="#charts">Charts</a>`
   - Click it
   - Should smoothly scroll to the charts section

3. **Test reduced motion**:
   - Enable "Reduce Motion" in OS settings
   - Try scrolling
   - Should scroll instantly (no animation)

### Automated Testing

```tsx
// Example test
import { renderHook } from '@testing-library/react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

test('scrollTo calls window.scrollTo with correct params', () => {
  const { result } = renderHook(() => useSmoothScroll());
  const scrollToSpy = vi.spyOn(window, 'scrollTo');

  result.current.scrollTo({ target: '#test', offset: 100 });

  expect(scrollToSpy).toHaveBeenCalled();
});
```

---

## 🚀 Performance Notes

- **Smooth scroll is CSS-based**: No JavaScript overhead for anchor links
- **Event listener optimization**: Scroll listener in `ScrollToTop` uses passive mode
- **Debouncing**: Not needed as CSS handles smooth scroll natively
- **No external dependencies**: Pure browser APIs

---

## 📚 Resources

- [MDN: scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Window.scrollTo()](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo)

---

## 🎉 Summary

✅ Global smooth scroll enabled
✅ Custom hook for programmatic scrolling
✅ Scroll to top button added
✅ Accessibility compliant
✅ Zero performance impact
✅ Works on all modern browsers

**Ready to use!** All navigation links will now scroll smoothly automatically.
