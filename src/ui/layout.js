// Place a floating label near its anchor, inside the viewport and clear of HUD.
export const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function placeFloating(anchor, size, bounds, obstacles = []) {
  const w = Math.min(size.w, bounds.right - bounds.left), h = Math.min(size.h, bounds.bottom - bounds.top);
  const rect = (x, y) => ({ x: Math.max(bounds.left, Math.min(bounds.right - w, x)), y: Math.max(bounds.top, Math.min(bounds.bottom - h, y)), w, h });
  const preferred = rect(anchor.x - w / 2, anchor.y - h);
  const fits = r => !obstacles.some(o => intersects(r, o));
  if (fits(preferred)) return preferred;
  let best = null, score = Infinity;
  for (let y = bounds.top; y <= bounds.bottom - h; y += h + 6) for (let x = bounds.left; x <= bounds.right - w; x += w + 6) {
    const candidate = rect(x, y), distance = (x - preferred.x) ** 2 + (y - preferred.y) ** 2;
    if (distance < score && fits(candidate)) { best = candidate; score = distance; }
  }
  return best || preferred;
}
