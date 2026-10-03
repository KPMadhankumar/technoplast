# Browser verification

Tested in headless Chromium 131 with WebGL rendered through SwiftShader. Mobile tests use emulated touch viewports; physical iOS/Android hardware and Safari were not tested.

| Viewport | GLB loads | Pin / release | No horizontal overflow | Panels / CTA | JS errors |
|---|---|---|---|---|---|
| 1920 × 1080 | Pass | Pass | Pass | Pass | None |
| 1440 × 900 | Pass | Pass | Pass | Pass | None |
| 1024 × 768 | Pass | Pass | Pass | Pass | None |
| 768 × 1024 | Pass | Pass | Pass | Pass | None |
| 430 × 932 | Pass | Pass | Pass | Pass | None |
| 375 × 812 | Pass | Pass | Pass | Pass | None |

Four scroll positions checked per viewport: introduction, first features, second features, final quote. Screenshots visually reviewed at desktop, tablet and mobile sizes. A test-only continuation block confirmed the section unpins; it is not included in the demo.

Additional checks passed:
- Reverse scrolling restores the intro.
- Resizing from 1440px to 375px keeps one ScrollTrigger and a correctly resized canvas.
- Native touch swipe advances page scroll.
- Reduced motion: no pinning, all content accessible.
- Failed GLB request: readable details and accessible quote CTA.
- The supplied GLB is byte-for-byte unchanged.

The demo quote link opens a draft email with no recipient. Connect it to the existing website contact destination before publishing.
