/**
 * Pseudo-QR déterministe (démo). Génère une grille à partir d'une chaîne —
 * purement visuel, non scannable. Remplacé par un vrai QR à l'intégration.
 */
export function Qr({ value, size = 148 }: { value: string; size?: number }) {
  const n = 21;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  for (let i = 0; i < n * n; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    cells.push((h & 1) === 1);
  }

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };

  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code de réservation">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        if (isFinder(r, c)) return null;
        return on ? <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="#16182b" /> : null;
      })}
      {/* finder patterns */}
      {[
        [0, 0],
        [0, n - 7],
        [n - 7, 0],
      ].map(([r, c], k) => (
        <g key={k}>
          <rect x={c * cell} y={r * cell} width={cell * 7} height={cell * 7} fill="#16182b" />
          <rect x={(c + 1) * cell} y={(r + 1) * cell} width={cell * 5} height={cell * 5} fill="#fff" />
          <rect x={(c + 2) * cell} y={(r + 2) * cell} width={cell * 3} height={cell * 3} fill="#16182b" />
        </g>
      ))}
    </svg>
  );
}
