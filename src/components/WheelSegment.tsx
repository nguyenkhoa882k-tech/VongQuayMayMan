import React from 'react';
import { Path, Text as SvgText } from 'react-native-svg';

type Props = {
  cx: number;
  cy: number;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  label: string;
  labelColor?: string;
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = degToRad(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number) {
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, endAngleDeg);
  const sweep = Math.abs(endAngleDeg - startAngleDeg);
  const largeArcFlag = sweep > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export default function WheelSegment({
  cx,
  cy,
  radius,
  startAngleDeg,
  endAngleDeg,
  fill,
  stroke,
  strokeWidth,
  label,
  labelColor = '#0F172A',
}: Props) {
  const d = arcPath(cx, cy, radius, startAngleDeg, endAngleDeg);

  const midAngle = (startAngleDeg + endAngleDeg) / 2;
  const labelPoint = polarToCartesian(cx, cy, radius * 0.65, midAngle);

  return (
    <>
      <Path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <SvgText
        x={labelPoint.x}
        y={labelPoint.y}
        fill={labelColor}
        fontSize={12}
        fontWeight="700"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {label}
      </SvgText>
    </>
  );
}
