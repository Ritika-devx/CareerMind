import type { ClusterProfile } from '../types/careermind';

interface ClusterScatterSvgProps {
  centers: number[][];
  profiles: ClusterProfile[];
  highlightedClusterId?: number | null;
  pointCoords?: [number, number] | null;
  pointLabel?: string;
}

const CLUSTER_COLORS = [
  '#2563EB',
  '#6D28D9',
  '#0D9488',
  '#D97706',
  '#DB2777',
  '#0284C7',
  '#4F46E5',
];

export function ClusterScatterSvg({
  centers,
  profiles,
  highlightedClusterId = null,
  pointCoords = null,
  pointLabel = 'Submitted Job',
}: ClusterScatterSvgProps) {
  if (!centers || centers.length === 0) {
    return null;
  }

  const allX = centers.map((c) => c[0]).concat(pointCoords ? [pointCoords[0]] : []);
  const allY = centers.map((c) => c[1]).concat(pointCoords ? [pointCoords[1]] : []);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const padX = Math.max(0.08, (maxX - minX) * 0.22);
  const padY = Math.max(0.08, (maxY - minY) * 0.22);

  const x0 = minX - padX;
  const x1 = maxX + padX;
  const y0 = minY - padY;
  const y1 = maxY + padY;

  const width = 560;
  const height = 280;
  const margin = 38;

  const mapX = (x: number) =>
    margin + ((x - x0) / Math.max(1e-6, x1 - x0)) * (width - margin * 2);
  const mapY = (y: number) =>
    height - margin - ((y - y0) / Math.max(1e-6, y1 - y0)) * (height - margin * 2);

  const zeroX = mapX(0);
  const zeroY = mapY(0);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          maxHeight: '280px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          display: 'block',
        }}
        role="img"
        aria-label="2D PCA cluster centroids and predicted job projection"
      >
        {/* Subtle reference axes through origin if inside bounds */}
        {zeroX >= margin && zeroX <= width - margin && (
          <line
            x1={zeroX}
            y1={margin - 8}
            x2={zeroX}
            y2={height - margin + 8}
            stroke="#E2E8F0"
            strokeDasharray="3 3"
          />
        )}
        {zeroY >= margin && zeroY <= height - margin && (
          <line
            x1={margin - 8}
            y1={zeroY}
            x2={width - margin + 8}
            y2={zeroY}
            stroke="#E2E8F0"
            strokeDasharray="3 3"
          />
        )}

        {/* Line from submitted job to assigned cluster center */}
        {pointCoords &&
          highlightedClusterId !== null &&
          centers[highlightedClusterId] && (
            <line
              x1={mapX(pointCoords[0])}
              y1={mapY(pointCoords[1])}
              x2={mapX(centers[highlightedClusterId][0])}
              y2={mapY(centers[highlightedClusterId][1])}
              stroke="#6D28D9"
              strokeWidth="1.75"
              strokeDasharray="5 4"
            />
          )}

        {/* Cluster centroids */}
        {centers.map((center, cid) => {
          const cx = mapX(center[0]);
          const cy = mapY(center[1]);
          const isSelected = highlightedClusterId === cid;
          const profile = profiles.find((p) => p.cluster_id === cid);
          const color = CLUSTER_COLORS[cid % CLUSTER_COLORS.length];

          return (
            <g key={cid}>
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 16 : 11}
                fill={color}
                fillOpacity={isSelected ? 0.2 : 0.12}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              <circle cx={cx} cy={cy} r={4} fill={color} />
              <text
                x={cx}
                y={cy - (isSelected ? 21 : 16)}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isSelected ? '700' : '600'}
                fill="#0F172A"
                fontFamily="JetBrains Mono, monospace"
              >
                C{cid}
                {profile ? ` (${profile.job_count})` : ''}
              </text>
            </g>
          );
        })}

        {/* Submitted job PCA coordinate */}
        {pointCoords && (
          <g>
            <rect
              x={mapX(pointCoords[0]) - 6}
              y={mapY(pointCoords[1]) - 6}
              width="12"
              height="12"
              rx="2"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x={mapX(pointCoords[0]) + 10}
              y={mapY(pointCoords[1]) + 4}
              fontSize="11"
              fontWeight="600"
              fill="#0F172A"
              fontFamily="DM Sans, sans-serif"
            >
              {pointLabel}
            </text>
          </g>
        )}

        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#64748B"
          fontFamily="DM Sans, sans-serif"
        >
          PCA Component 1 (x) · PCA Component 2 (y)
        </text>
      </svg>
    </div>
  );
}
