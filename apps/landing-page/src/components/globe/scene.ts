import * as THREE from 'three';
import { colors } from '@seego/ui';
import {
  ACCENT,
  buildAtmosphere,
  buildMarker,
  buildRoute,
  INK,
  RADIUS,
  TUBE_RADIAL,
  type Marker,
  type Place,
  type Route,
} from './geometry';
import { buildLandDots } from './landDots';

const BASE_PITCH = THREE.MathUtils.degToRad(32);

/**
 * Builds the whole globe. `tilt` handles pitch, `spin` (inside it) handles yaw.
 * `legs` are the routes drawn between places.
 */
export function createGlobeScene(places: Place[], legs: [Place, Place][]) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  scene.add(new THREE.HemisphereLight('#ffffff', colors.surface, 2.2));
  const sun = new THREE.DirectionalLight('#ffffff', 1.2);
  sun.position.set(-3, 2, 4);
  scene.add(sun);

  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  tilt.add(spin);
  tilt.rotation.x = BASE_PITCH;
  scene.add(tilt, buildAtmosphere());

  spin.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 8 }),
    ),
    buildLandDots(),
  );

  const routes = legs.map(([from, to]) => buildRoute(from, to));
  routes.forEach(({ tube, traveller }) => spin.add(tube, traveller));

  const markers = places.map((p, i) => buildMarker(p, i === 0 ? INK : ACCENT));
  markers.forEach(({ group }) => spin.add(group));

  return { scene, camera, tilt, spin, routes, markers };
}

/**
 * Draws the part of a route between `shrink` and `grow` (both 0..1, from its start).
 * The traveller dot rides the tip while the route is growing.
 */
export function setRouteProgress({ curve, tube, traveller }: Route, grow: number, shrink = 0) {
  const triangle = TUBE_RADIAL * 6;
  const total = tube.geometry.index?.count ?? 0;
  const startIndex = Math.floor((total * shrink) / triangle) * triangle;
  const endIndex = Math.floor((total * grow) / triangle) * triangle;
  tube.geometry.setDrawRange(startIndex, Math.max(0, endIndex - startIndex));
  traveller.visible = grow > 0 && grow < 1;
  if (traveller.visible) traveller.position.copy(curve.getPointAt(grow));
}

export function animateMarkers(markers: Marker[], time: number, reduced: boolean) {
  markers.forEach(({ ring }, i) => {
    const pulse = reduced ? 0.5 : (((time * 0.8 + i * 0.3) % 1) + 1) % 1;
    ring.scale.setScalar(1 + pulse * 1.6);
    (ring.material as THREE.MeshBasicMaterial).opacity = 1 - pulse;
  });
}

const worldPos = new THREE.Vector3();
const toCamera = new THREE.Vector3();

/** Screen position of a marker and how much it faces the camera (fades labels on the far side). */
export function projectMarker(marker: Marker, camera: THREE.Camera, width: number, height: number) {
  marker.group.getWorldPosition(worldPos);
  toCamera.copy(camera.position).sub(worldPos).normalize();
  const facing = worldPos.clone().normalize().dot(toCamera);
  worldPos.project(camera);
  return {
    x: (worldPos.x * 0.5 + 0.5) * width,
    y: (-worldPos.y * 0.5 + 0.5) * height,
    opacity: THREE.MathUtils.clamp((facing - 0.15) * 4, 0, 1),
  };
}

export function disposeScene(scene: THREE.Scene) {
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
}
