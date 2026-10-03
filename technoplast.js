import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** One instance per section; no global scroll handlers or page-wide CSS. */
export async function initTechnoplast(section) {
  const viewport = section.querySelector('.tp-viewport');
  const loading = section.querySelector('.tp-loading');
  const stage = section.querySelector('.tp-stage');
  const panels = [...section.querySelectorAll('.tp-panel')];
  const chapters = [...section.querySelectorAll('.tp-chapters span')];
  const mobileQuery = window.matchMedia('(max-width: 767.98px)');
  let renderer, model, environment, mm, frame = 0, visible = true, disposed = false;
  let animation, observer, resizeObserver;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.set(0, .17, 6.5);
  camera.lookAt(0, 0, 0);
  const state = { rotation: 0, zoom: 1, side: 0, lift: 0 };
  const markActive = (name) => {
    panels.forEach(panel => {
      const active = name === 'all' || panel.dataset.panel === name;
      panel.inert = !active;
      panel.setAttribute('aria-hidden', String(!active));
      panel.classList.toggle('is-current', active);
    });
  };
  const staticMode = () => {
    section.classList.add('tp-static');
    markActive('all');
  };
  function draw() {
    frame = 0;
    if (disposed || !visible || document.hidden || !model) return;
    const worldHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    model.rotation.y = state.rotation;
    model.rotation.x = -.025;
    model.scale.setScalar(state.zoom);
    model.position.set(state.side * worldHeight * camera.aspect, state.lift, 0);
    renderer.render(scene, camera);
  }
  function requestRender() {
    if (!frame && !disposed) frame = requestAnimationFrame(draw);
  }
  function resize() {
    if (!renderer || disposed) return;
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileQuery.matches ? 1.35 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the complete supplied model at both portrait and landscape ratios.
    const requiredHeight = Math.max(3.5, 3.0 / camera.aspect);
    camera.position.z = requiredHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
    requestRender();
  }
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobileQuery.matches, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .85;
    viewport.appendChild(renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .6;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xa27c36, .7));
    const key = new THREE.DirectionalLight(0xfff6e4, 2.0);
    key.position.set(-3, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.3);
    rim.position.set(4, 2, -2); scene.add(rim);
    const gltf = await new GLTFLoader().loadAsync(section.dataset.model);
    if (disposed) return;
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    // Container preserves a centered pivot without modifying the original GLB.
    const product = new THREE.Group();
    model.position.sub(center); product.add(model); model = product;
    scene.add(model);
    loading.remove();
    section.dataset.modelLoaded = 'true';
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestRender(); }, { rootMargin: '100px' });
    observer.observe(section);
    document.addEventListener('visibilitychange', requestRender);
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) throw new Error('Animation libraries did not load.');
    gsap.registerPlugin(ScrollTrigger);
    mm = gsap.matchMedia();
    mm.add({ mobile: '(max-width: 767.98px)', desktop: '(min-width: 768px)', tablet: '(min-width: 768px) and (max-width: 991.98px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      const { mobile, tablet, reduce } = context.conditions;
      section.classList.toggle('tp-static', reduce);
      Object.assign(state, { rotation: 0, zoom: 1, side: 0, lift: 0 });
      if (reduce) { staticMode(); resize(); return () => section.classList.remove('tp-static'); }
      markActive(null);
      const intro = section.querySelector('.tp-intro');
      const note = section.querySelector('.tp-intro-note');
      const shadow = section.querySelector('.tp-shadow');
      gsap.set(panels, { autoAlpha: 0, y: 20 });
      gsap.set([intro, note], { autoAlpha: 1 });
      const side = mobile ? 0 : -.235;
      const zoom = mobile ? 1.1 : 1.14;
      animation = gsap.timeline({
        defaults: { ease: 'power1.inOut' },
        onUpdate: requestRender,
        scrollTrigger: {
          id: section.id, trigger: section, pin: stage, start: 'top top',
          end: () => '+=' + window.innerHeight * (mobile ? 2.7 : 4.3),
          scrub: mobile ? .35 : .75, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            const p = self.progress;
            const chapter = p < .28 ? 0 : p < .54 ? 1 : p < .79 ? 2 : 3;
            chapters.forEach((el, i) => el.classList.toggle('is-active', chapter === i));
            section.querySelector('.tp-counter').textContent = `0${chapter + 1} — 04`;
            section.querySelector('[data-scroll-label]').textContent = p > .96 ? 'CONTINUE SCROLLING' : 'SCROLL TO EXPLORE';
          }
        }
      });
      animation.to(state, { rotation: mobile ? .6 : 1.0, duration: 1.5 }, 0)
        .to([intro, note], { autoAlpha: 0, duration: .45 }, .85)
        .to(state, { zoom, rotation: mobile ? .8 : 1.6, duration: .8 }, 1.2)
        .to(state, { side, zoom: tablet ? .65 : zoom, rotation: mobile ? -.3 : -.4, duration: 1.0 }, 1.9)
        .to(shadow, { left: mobile ? '50%' : '26.5%', scaleX: .85, duration: 1 }, 1.9)
        .to(panels[0], { autoAlpha: 1, y: 0, duration: .5 }, 2.35)
        .to(state, { rotation: mobile ? .15 : .15, duration: 1.35 }, 2.9)
        .to(panels[0], { autoAlpha: 0, y: -15, duration: .35 }, 4.05)
        .to(panels[1], { autoAlpha: 1, y: 0, duration: .5 }, 4.4)
        .to(state, { rotation: mobile ? .7 : Math.PI * 1.7, duration: 1.65 }, 4.5)
        .to(panels[1], { autoAlpha: 0, y: -15, duration: .35 }, 6.05)
        .to(state, { rotation: mobile ? 0 : Math.PI * 2, zoom: tablet ? .65 : .94, duration: 1.2 }, 6.35)
        .to(panels[2], { autoAlpha: 1, y: 0, duration: .55 }, 6.5)
        .to(state, { duration: .85 }, 7.55)
        .to(section.querySelector('.tp-progress'), { scaleX: 1, duration: 8.4, ease: 'none' }, 0);
      // Active content follows the scrubbed timeline, including reverse scrolling.
      animation.eventCallback('onUpdate', () => {
        const t = animation.time();
        markActive(t >= 6.5 ? 'quote' : t >= 4.4 && t < 6.4 ? 'body' : t >= 2.35 && t < 4.4 ? 'detail' : null);
        requestRender();
      });
      resize();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => { animation = null; markActive(null); };
    });
    // Integration hook for SPAs: remove only this instance's resources.
    section.technoplast = { refresh: () => { resize(); ScrollTrigger.refresh(); }, destroy };
  } catch (error) {
    console.error('Technoplast experience:', error);
    staticMode();
    loading.textContent = 'The 3D view is unavailable. Explore the product details below.';
    section.dataset.modelError = error.message;
  }
  function destroy() {
    disposed = true;
    mm?.revert(); observer?.disconnect(); resizeObserver?.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', requestRender);
    scene.traverse(object => {
      object.geometry?.dispose();
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      materials.forEach(material => { for (const value of Object.values(material)) if (value?.isTexture) value.dispose(); material.dispose(); });
    });
    environment?.dispose(); renderer?.dispose(); renderer?.domElement.remove();
    delete section.technoplast;
  }
  return { destroy };
}

document.querySelectorAll('.tp-experience').forEach(initTechnoplast);
