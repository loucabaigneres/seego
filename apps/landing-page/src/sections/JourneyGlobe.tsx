import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion, type MotionValue } from 'motion/react';
import {
  animateMarkers,
  createGlobeScene,
  disposeScene,
  projectMarker,
  setRouteProgress,
} from '../components/globe/scene';
import { formatCoords, journeyAt, LEGS, STOPS } from './journey';

type JourneyGlobeProps = {
  /** Scroll progress of the hero (0..1); it drives the camera and the routes. */
  progress: MotionValue<number>;
  onError?: () => void;
};

const lerp = THREE.MathUtils.lerp;

/** Shortest way round between two longitudes. */
function lerpLon(a: number, b: number, t: number) {
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return a + delta * t;
}

/** The hero globe: scroll flies the camera from stop to stop and draws each leg. */
export default function JourneyGlobe({ progress, onError }: JourneyGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const calloutTextRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onError?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.prepend(renderer.domElement);

    const { scene, camera, tilt, spin, routes, markers } = createGlobeScene(STOPS, LEGS);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(container);

    const clock = new THREE.Clock();
    let shownStop = -1;
    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const time = clock.getElapsedTime();
      const { intro, leg, travel, current } = journeyAt(progress.get());
      const from = STOPS[leg];
      const to = STOPS[leg + 1];

      // Fly from one stop to the next, pulling the camera back mid-flight.
      const lat = lerp(from.lat, to.lat, travel);
      const lon = lerpLon(from.lon, to.lon, travel);
      spin.rotation.y = THREE.MathUtils.degToRad(-90 - lon);
      tilt.rotation.x = THREE.MathUtils.degToRad(lat * 0.85);
      camera.position.z =
        lerp(5, 3.6, intro * intro * (3 - 2 * intro)) + Math.sin(Math.PI * travel) * 0.8 * intro;

      routes.forEach((route, i) => setRouteProgress(route, i < leg ? 1 : i === leg ? travel : 0));
      animateMarkers(markers, time, reduced);

      // Igloo-style callout pinned to the stop the camera is closest to.
      const callout = calloutRef.current;
      if (callout) {
        const rect = container.getBoundingClientRect();
        const { x, y, opacity } = projectMarker(markers[current], camera, rect.width, rect.height);
        const settled = Math.abs(travel - 0.5) * 2; // 0 mid-flight, 1 parked
        callout.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        callout.style.opacity = String(opacity * settled * intro);
        if (current !== shownStop && calloutTextRef.current) {
          shownStop = current;
          calloutTextRef.current.textContent = `${STOPS[current].name.toUpperCase()} / ${formatCoords(STOPS[current])}`;
        }
      }

      renderer.render(scene, camera);
      // Fade in once the first frame exists, instead of popping in when three.js arrives.
      container.style.opacity = '1';
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
    // onError only matters at setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0 opacity-0 transition-opacity duration-700">
      <div
        ref={calloutRef}
        className="pointer-events-none absolute left-0 top-0 opacity-0"
        aria-hidden="true"
      >
        {/* Leader line from the marker, then the label */}
        <span className="absolute left-0 top-0 h-px w-10 origin-left -rotate-45 bg-ink" />
        <span
          ref={calloutTextRef}
          className="absolute left-7 -top-10 whitespace-nowrap rounded-md bg-ink px-2 py-1 tabular-nums text-[0.6rem] font-bold tracking-[0.2em] text-ink-inverse"
        />
      </div>
    </div>
  );
}
