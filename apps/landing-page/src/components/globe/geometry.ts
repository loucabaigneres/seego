import * as THREE from 'three';
import type { Place } from './destinations';

// Brand tokens, mirrored from index.css (WebGL can't read CSS variables).
export const ACCENT = '#ff4d4d';
export const INK = '#1a1a1a';
export const MUTED = '#8a8276';

export const RADIUS = 1;
export const TUBE_SEGMENTS = 64;
export const TUBE_RADIAL = 6;

export function toVector(lat: number, lon: number, radius = RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function buildAtmosphere() {
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

export type Route = {
  curve: THREE.QuadraticBezierCurve3;
  tube: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  traveller: THREE.Mesh;
};

export function buildRoute(from: Place, to: Place): Route {
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

export function buildMarker(place: Place, color: string) {
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

export type Marker = ReturnType<typeof buildMarker>;
