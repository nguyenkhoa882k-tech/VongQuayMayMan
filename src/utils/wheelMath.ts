export type WheelSegmentData = {
  id: string;
  label: string;
  color: string;
  rewardValue: number;
};

export const WHEEL_START_ANGLE_DEG = -90;

export function getSweepAngleDeg(segmentCount: number) {
  return 360 / segmentCount;
}

export function clampSegmentCount(segmentCount: number) {
  return Math.max(2, Math.floor(segmentCount));
}

export function normalizeAngleDeg(angleDeg: number) {
  const mod = ((angleDeg % 360) + 360) % 360;
  return mod;
}

export function getSegmentCenterAngleDeg(index: number, segmentCount: number) {
  const sweep = getSweepAngleDeg(segmentCount);
  return WHEEL_START_ANGLE_DEG + index * sweep + sweep / 2;
}

export function getRotationToCenterIndexAtPointerDeg(index: number, segmentCount: number) {
  const center = getSegmentCenterAngleDeg(index, segmentCount);
  const pointerAngle = WHEEL_START_ANGLE_DEG;
  return normalizeAngleDeg(pointerAngle - center);
}

export function getSpinToIndexDeltaDeg(params: {
  selectedIndex: number;
  segmentCount: number;
  fullRotations: number;
  currentRotationDeg: number;
}) {
  const { selectedIndex, segmentCount, fullRotations, currentRotationDeg } = params;

  const normalizedCurrent = normalizeAngleDeg(currentRotationDeg);
  const targetRotation = getRotationToCenterIndexAtPointerDeg(selectedIndex, segmentCount);

  const delta = normalizeAngleDeg(targetRotation - normalizedCurrent);
  return fullRotations * 360 + delta;
}

export function pickRandomIndex(segmentCount: number) {
  return Math.floor(Math.random() * segmentCount);
}
