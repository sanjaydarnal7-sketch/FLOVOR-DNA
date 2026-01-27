import React from 'react';

interface RadarChartProps {
  data: { label: string; value: number }[];
  color: string;
  size?: number;
  maxValue?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, color, size = 100, maxValue = 10 }) => {
  const center = size / 2;
  const radius = size / 2 * 0.7;

  if (!data || data.length === 0) {
    return <div style={{ width: size, height: size }} />;
  }
  
  const numAxes = data.length;

  const points = data.map((item, i) => {
    const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
    const valueRadius = (item.value / maxValue) * radius;
    const x = center + valueRadius * Math.cos(angle);
    const y = center + valueRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const axisPoints = Array.from({ length: numAxes }).map((_, i) => {
    const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });
  
  const labelPoints = data.map((item, i) => {
     const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
     const labelRadius = radius * 1.4;
     const x = center + labelRadius * Math.cos(angle);
     const y = center + labelRadius * Math.sin(angle);
     return { x, y, label: item.label };
  });

  const colorVal = color.startsWith('var') ? `rgb(${getComputedStyle(document.documentElement).getPropertyValue(color.match(/--[a-zA-Z0-9-]+/)[0]).trim()})` : color;
  const rgbaColor = (opacity: number) => {
      const hex = colorVal.startsWith('#') ? colorVal : '#888'; // fallback
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }


  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid lines */}
      <g opacity="0.3">
        {axisPoints.map((point, i) => (
          <line key={i} x1={center} y1={center} x2={point.x} y2={point.y} stroke={color} strokeWidth="0.5" />
        ))}
        {/* Concentric polygons */}
        {[0.33, 0.66, 1].map(scale => (
            <polygon 
                key={scale}
                points={axisPoints.map(p => `${center + (p.x - center) * scale},${center + (p.y - center) * scale}`).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
            />
        ))}
      </g>
      {/* Data polygon */}
      <polygon points={points} fill={rgbaColor(0.25)} stroke={color} strokeWidth="1.5" />
       {/* Data points */}
      {points.split(' ').map((p, i) => {
          const [x, y] = p.split(',');
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
      {/* Labels */}
      <g>
        {labelPoints.map((point, i) => (
          <text 
            key={i} 
            x={point.x} 
            y={point.y} 
            fill={color} 
            fontSize="9" 
            textAnchor="middle" 
            dominantBaseline="middle"
            className="font-mono font-bold"
          >
            {point.label}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default RadarChart;
