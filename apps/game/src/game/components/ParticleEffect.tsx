import React, { useEffect } from "react";
import { Circle, Group } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  useDerivedValue,
} from "react-native-reanimated";

interface Particle {
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  color: string;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 8;
const DURATION = 400;

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
    distance: 20 + Math.random() * 25,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 50,
  }));
}

export default function ParticleEffect({ x, y, color, onComplete }: ParticleEffectProps) {
  const progress = useSharedValue(0);
  const particles = React.useRef(generateParticles()).current;

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    const timeout = setTimeout(() => onComplete?.(), DURATION + 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Group>
      {particles.map((p, i) => (
        <ParticleDot key={i} x={x} y={y} particle={p} progress={progress} color={color} />
      ))}
    </Group>
  );
}

function ParticleDot({
  x,
  y,
  particle,
  progress,
  color,
}: {
  x: number;
  y: number;
  particle: Particle;
  progress: { value: number };
  color: string;
}) {
  const px = useDerivedValue(() => {
    return x + Math.cos(particle.angle) * particle.distance * progress.value;
  });
  const py = useDerivedValue(() => {
    return y + Math.sin(particle.angle) * particle.distance * progress.value;
  });
  const opacity = useDerivedValue(() => {
    return 1 - progress.value;
  });
  const r = useDerivedValue(() => {
    return particle.size * (1 - progress.value * 0.5);
  });

  return <Circle cx={px} cy={py} r={r} color={color} opacity={opacity} />;
}
