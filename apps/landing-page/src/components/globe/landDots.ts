import * as THREE from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land110m from 'world-atlas/land-110m.json';
import { MUTED, RADIUS, toVector } from './geometry';

const DOT_COUNT = 14000;

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

/** Dotted continents: evenly spaced points on the sphere, kept only where there is land. */
export function buildLandDots() {
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
