import * as THREE from 'three';

/** Drag-to-spin on a canvas, with inertia once released. Call `step()` once per frame. */
export function createDragRotation(canvas: HTMLCanvasElement) {
  const state = { yaw: 0, pitch: 0, dragging: false };
  let velocity = 0;
  let lastX = 0;
  let lastY = 0;

  canvas.style.touchAction = 'pan-y';
  canvas.style.cursor = 'grab';

  const onDown = (e: PointerEvent) => {
    state.dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velocity = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  };
  const onMove = (e: PointerEvent) => {
    if (!state.dragging) return;
    velocity = (e.clientX - lastX) * 0.006;
    state.yaw += velocity;
    state.pitch = THREE.MathUtils.clamp(state.pitch + (e.clientY - lastY) * 0.004, -0.4, 0.4);
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = () => {
    state.dragging = false;
    canvas.style.cursor = 'grab';
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  return {
    state,
    step() {
      if (state.dragging) return;
      state.yaw += velocity;
      velocity *= 0.94;
      state.pitch *= 0.96;
    },
    dispose() {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    },
  };
}
