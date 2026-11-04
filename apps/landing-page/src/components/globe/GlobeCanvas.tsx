import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'motion/react';
import { DESTINATIONS, ORIGIN } from './destinations';
import { createDragRotation } from './dragRotation';
import {
  animateMarkers,
  animateRoutes,
  ARC_CYCLE,
  BASE_PITCH,
  BASE_YAW,
  createGlobeScene,
  disposeScene,
  projectMarker,
} from './scene';

const PLACES = [ORIGIN, ...DESTINATIONS];

type GlobeCanvasProps = {
  onError?: () => void;
};

export default function GlobeCanvas({ onError }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
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

    const { scene, camera, tilt, spin, routes, markers } = createGlobeScene(PLACES);
    const drag = createDragRotation(renderer.domElement);

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

    // Pause the loop while the globe is off-screen.
    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(container);

    const clock = new THREE.Clock();
    let autoYaw = 0;
    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      const time = reduced ? ARC_CYCLE * 0.6 : clock.elapsedTime;

      drag.step();
      if (!reduced && !drag.state.dragging) autoYaw += delta * 0.08;
      // Scrolling past the section turns the globe; centred section = no offset.
      const rect = container.getBoundingClientRect();
      const scrollYaw = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.0012;
      spin.rotation.y = BASE_YAW + autoYaw + drag.state.yaw + scrollYaw;
      tilt.rotation.x = BASE_PITCH + drag.state.pitch;

      animateRoutes(routes, time);
      animateMarkers(markers, time, reduced);

      markers.forEach((marker, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        const { x, y, opacity } = projectMarker(marker, camera, rect.width, rect.height);
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        label.style.opacity = String(opacity);
      });

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      drag.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
    // onError only matters at setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {PLACES.map((place, i) => (
        <div
          key={place.name}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          aria-hidden="true"
        >
          <span
            className={`ml-3 -mt-3 block whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-bold shadow-sm ${
              i === 0 ? 'bg-ink text-white' : 'bg-white text-ink'
            }`}
          >
            {place.name}
          </span>
        </div>
      ))}
    </div>
  );
}
