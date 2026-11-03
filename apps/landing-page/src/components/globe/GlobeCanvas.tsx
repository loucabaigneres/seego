import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land110m from 'world-atlas/land-110m.json';
import { usePrefersReducedMotion } from '../../lib/motion';
import { DESTINATIONS, ORIGIN, type Place } from './destinations';

// Brand tokens, mirrored from index.css (WebGL can't read CSS variables).
const ACCENT = '#ff4d4d';
const INK = '#1a1a1a';
const MUTED = '#8a8276';

const RADIUS = 1;
const DOT_COUNT = 14000;
const TUBE_SEGMENTS = 64;
const TUBE_RADIAL = 6;
const ARC_CYCLE = 5; // seconds per arc animation loop

function toVector(lat: number, lon: number, radius = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Rasterises the land polygons once so we can ask "is this lat/lon on land?". */
function buildLandMask(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return () => false;

  const topology = land110m as unknown as Parameters<typeof feature>[0];
  const land = feature(topology, topology.objects.land);
  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI));
  ctx.beginPath();
  geoPath(projection, ctx)(land);
  ctx.fill();

  const alpha = ctx.getImageData(0, 0, width, height).data;
  return (lat: number, lon: number) => {
    const x = Math.min(width - 1, Math.floor(((lon + 180) / 360) * width));
    const y = Math.min(height - 1, Math.floor(((90 - lat) / 180) * height));
    return alpha[(y * width + x) * 4 + 3] > 128;
  };
}

function buildLandDots() {
  const isLand = buildLandMask();
  const positions: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  // Fibonacci sphere: evenly spaced points, kept only where there is land.
  for (let i = 0; i < DOT_COUNT; i++) {
    const y = 1 - (i / (DOT_COUNT - 1)) * 2;
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    const lon = (THREE.MathUtils.radToDeg(golden * i) % 360) - 180;
    if (!isLand(lat, lon)) continue;
    const v = toVector(lat, lon, RADIUS * 1.002);
    positions.push(v.x, v.y, v.z);
  }

  const dotTexture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  })();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: MUTED,
    size: 0.024,
    map: dotTexture,
    transparent: true,
    alphaTest: 0.5,
  });
  return new THREE.Points(geometry, material);
}

function buildAtmosphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS * 1.12, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(ACCENT) } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(color, clamp(intensity * 0.35, 0.0, 0.35));
        }`,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    }),
  );
}

type Route = {
  curve: THREE.QuadraticBezierCurve3;
  tube: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  traveller: THREE.Mesh;
};

function buildRoute(from: Place, to: Place): Route {
  const start = toVector(from.lat, from.lon);
  const end = toVector(to.lat, to.lon);
  const lift = RADIUS + start.distanceTo(end) * 0.55;
  const control = start.clone().add(end).normalize().multiplyScalar(lift);
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);

  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.005, TUBE_RADIAL, false),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 }),
  );
  const traveller = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 16, 16),
    new THREE.MeshBasicMaterial({ color: ACCENT }),
  );
  return { curve, tube, traveller };
}

function buildMarker(place: Place, color: string) {
  const group = new THREE.Group();
  const position = toVector(place.lat, place.lon, RADIUS * 1.004);
  group.position.copy(position);
  group.lookAt(position.clone().multiplyScalar(2));

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 24),
    new THREE.MeshBasicMaterial({ color }),
  );
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.026, 0.034, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide }),
  );
  group.add(dot, ring);
  return { group, ring };
}

type GlobeCanvasProps = {
  onError?: () => void;
};

export default function GlobeCanvas({ onError }: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const places = [ORIGIN, ...DESTINATIONS];

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
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';
    container.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    scene.add(new THREE.HemisphereLight('#ffffff', '#e2dcce', 2.2));
    const sun = new THREE.DirectionalLight('#ffffff', 1.2);
    sun.position.set(-3, 2, 4);
    scene.add(sun);

    // tilt (pitch) > spin (yaw) > globe content
    const tilt = new THREE.Group();
    const spin = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);

    spin.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 64, 64),
        new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 8 }),
      ),
    );
    spin.add(buildLandDots());
    scene.add(buildAtmosphere());

    const routes = DESTINATIONS.map((d) => buildRoute(ORIGIN, d));
    routes.forEach(({ tube, traveller }) => spin.add(tube, traveller));

    const markers = places.map((p, i) => buildMarker(p, i === 0 ? INK : ACCENT));
    markers.forEach(({ group }) => spin.add(group));

    // Face Europe first, northern hemisphere slightly towards the viewer.
    const baseYaw = THREE.MathUtils.degToRad(-90 - 8);
    tilt.rotation.x = THREE.MathUtils.degToRad(32);

    // ── Interaction: drag to spin with inertia, scroll nudges the rotation ──
    let dragYaw = 0;
    let dragPitch = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = (e.clientX - lastX) * 0.006;
      dragYaw += dx;
      dragPitch = THREE.MathUtils.clamp(dragPitch + (e.clientY - lastY) * 0.004, -0.4, 0.4);
      velocity = dx;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);

    // ── Sizing ──
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // ── Loop, paused while off-screen ──
    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(container);

    const clock = new THREE.Clock();
    const worldPos = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const triangle = TUBE_RADIAL * 6;
    let autoYaw = 0;
    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      const time = reduced ? ARC_CYCLE * 0.6 : clock.elapsedTime;

      if (!dragging) {
        if (!reduced) autoYaw += delta * 0.08;
        dragYaw += velocity;
        velocity *= 0.94;
        dragPitch *= 0.96;
      }
      // Scrolling past the section turns the globe; centred section = no offset.
      const rect = container.getBoundingClientRect();
      const scrollYaw = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.0012;
      spin.rotation.y = baseYaw + autoYaw + dragYaw + scrollYaw;
      tilt.rotation.x = THREE.MathUtils.degToRad(32) + dragPitch;

      // Each route grows from Paris, holds, then retracts towards its destination.
      routes.forEach(({ curve, tube, traveller }, i) => {
        const phase = ((((time + i * 0.9) % ARC_CYCLE) + ARC_CYCLE) % ARC_CYCLE) / ARC_CYCLE;
        const total = tube.geometry.index?.count ?? 0;
        const grow = THREE.MathUtils.clamp(phase / 0.45, 0, 1);
        const shrink = THREE.MathUtils.clamp((phase - 0.8) / 0.2, 0, 1);
        const startIndex = Math.floor((total * shrink) / triangle) * triangle;
        const endIndex = Math.floor((total * grow) / triangle) * triangle;
        tube.geometry.setDrawRange(startIndex, Math.max(0, endIndex - startIndex));
        traveller.visible = grow > 0 && grow < 1;
        if (traveller.visible) traveller.position.copy(curve.getPointAt(grow));
      });

      markers.forEach(({ ring }, i) => {
        const pulse = reduced ? 0.5 : (((time * 0.8 + i * 0.3) % 1) + 1) % 1;
        ring.scale.setScalar(1 + pulse * 1.6);
        (ring.material as THREE.MeshBasicMaterial).opacity = 1 - pulse;
      });

      // HTML labels follow their marker and fade out on the far side of the globe.
      const { width, height } = rect;
      markers.forEach(({ group }, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        group.getWorldPosition(worldPos);
        toCamera.copy(camera.position).sub(worldPos).normalize();
        const facing = worldPos.clone().normalize().dot(toCamera);
        worldPos.project(camera);
        const x = (worldPos.x * 0.5 + 0.5) * width;
        const y = (-worldPos.y * 0.5 + 0.5) * height;
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        label.style.opacity = String(THREE.MathUtils.clamp((facing - 0.15) * 4, 0, 1));
      });

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m: THREE.Material & { map?: THREE.Texture | null }) => {
            m.map?.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // `places` is static module data; onError only matters at setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {places.map((place, i) => (
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
