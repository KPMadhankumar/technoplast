# Technoplast 3D scroll section

A standalone Bootstrap 5 section, with the actual previously created Technoplast GLB. No header, footer or additional website sections. All runtime dependencies are included locally.

## Run

Extract the ZIP. Open this folder in VS Code and use **Live Server**, or run:

```sh
python -m http.server 8000
```

Visit http://localhost:8000. Use HTTP: ES modules and GLB loading do not work reliably by double-clicking index.html via file://. No npm install or build step is needed. Internet is not required once extracted.

## Files

- `index.html` — standalone demo and section markup.
- `technoplast.css` — scoped styling and responsive layouts.
- `technoplast.js` — Three.js scene and GSAP scroll timeline.
- `assets/technoplast-water-tank.glb` — original model, unchanged (476,920 bytes).
- `vendor/` — Bootstrap 5.3.3, Three.js 0.170.0, GSAP / ScrollTrigger 3.12.5 and required Three.js addons.

## Add to an existing Bootstrap website

1. Copy the `section.tp-experience` markup into the desired page position. It is one pinned section; normal sections before and after it will scroll normally.
2. Include `technoplast.css`. Reuse your existing Bootstrap 5 CSS rather than including it twice.
3. Copy `assets`, `vendor`, and `technoplast.js`, or adjust the paths to your existing asset directories.
4. Include the import map from the demo before any module scripts. If your website already has an import map, merge its entries instead. The loader and Three.js core must use the same version.
5. Load GSAP and ScrollTrigger once, before `technoplast.js`. Load the latter with `type="module"`.
6. Change `data-model` on the section if the model location changes. Paths in `data-model` resolve relative to the HTML page.
7. **Set the Request a Quote link to your existing contact URL or enquiry-modal trigger.** The demo link opens an email draft without a preconfigured recipient. It does not send or store any enquiry.
8. If using a fixed site header, account for its height in the ScrollTrigger `start` and section height. Avoid an overflow/transform wrapper around the section; a normal document scrolling context is assumed.

## Animation controls

The `gsap.matchMedia()` block contains the complete scroll sequence:

- Centered complete product.
- Rotate and move closer.
- Shift left on tablet / desktop, keeping content opposite.
- Reveal two detail panels and continue rotating.
- Return to a complete front view and reveal the quote CTA.
- Hold briefly, then release the pin.

Mobile uses a shorter pin, smaller rotations, a centered model and stacked content. The canvas never captures touch input. All scroll is native; no scroll-jacking or touch preventDefault listeners.

## Performance and accessibility

- 477 KB GLB; 20,560 triangles; embedded logo texture; no decoder needed.
- On-demand rendering: render on scroll updates or resize, not an endless WebGL loop.
- Rendering pauses outside the viewport and when the browser tab is hidden.
- Pixel ratio capped at 1.35 on mobile and 1.75 on larger layouts.
- No real-time shadows or postprocessing. Lighting uses one small generated environment map.
- ResizeObserver keeps the camera/canvas fitted to its actual container.
- Reduced-motion preference disables pinning and presents all content in normal flow.
- Hidden panels are inert and removed from the accessibility tree; the CTA is keyboard focusable when visible.
- Model/WebGL failures show a text fallback with product details and enquiry access.

For SPAs, call `document.querySelector('#technoplast-tank').technoplast.destroy()` before removing the section. Call `.technoplast.refresh()` after an external layout change. Exported `initTechnoplast(section)` can initialize dynamically inserted markup; do not initialize the same section twice.

## Product copy

Copy describes visible geometry only. No unverified claims about capacity, layer count, UV resistance, certifications, or warranty are included. Replace it with approved Technoplast specifications as needed. The model was reconstructed from one image; unseen rear details are approximate. This demo preserves that GLB byte-for-byte.

## Dependencies / documentation

- Bootstrap: https://getbootstrap.com/docs/5.3/ — MIT (included).
- Three.js: https://threejs.org/docs/ — MIT (included).
- GSAP / ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ and https://gsap.com/standard-license/ (copyright / license links are retained in vendor headers).
