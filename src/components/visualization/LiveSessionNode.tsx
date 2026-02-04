import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLiveSessionStore } from '../../stores/useLiveSessionStore'

interface LiveSessionNodeProps {
  position: [number, number, number]
  sessionId: string
  state: 'idle' | 'working' | 'waiting'
}

const stateColors = {
  idle: '#3b82f6', // Blue
  working: '#f97316', // Orange
  waiting: '#22c55e', // Green
}

export function LiveSessionNode({ position, sessionId, state }: LiveSessionNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectSession } = useLiveSessionStore()

  const baseColor = stateColors[state]

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : 0.9
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }

    // Animate pulse for working state
    if (pulseRef.current && state === 'working') {
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.2 + 1.2
      pulseRef.current.scale.set(pulse, pulse, pulse)
      pulseRef.current.material.opacity = 0.3 - Math.sin(clock.getElapsedTime() * 3) * 0.1
    }
  })

  const sessionLabel = useMemo(() => sessionId.slice(0, 8), [sessionId])

  return (
    <group position={position}>
      {/* Live session node - slightly larger than thread nodes */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => selectSession(sessionId)}
      >
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Pulsing glow for working/waiting states */}
      {(state === 'working' || state === 'waiting') && (
        <mesh ref={pulseRef} scale={1.2}>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial
            color={baseColor}
            transparent
            opacity={0.3}
            emissive={baseColor}
          />
        </mesh>
      )}

      {/* Hover highlight */}
      {hovered && (
        <mesh scale={[1.4, 1.4, 1.4]}>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial
            color={baseColor}
            transparent
            opacity={0.2}
            emissive={baseColor}
          />
        </mesh>
      )}

      {/* Label with state indicator */}
      <sprite position={[0, -0.7, 0]}>
        <spriteMaterial
          map={new THREE.CanvasTexture(
            createLabelCanvas(sessionLabel, state)
          )}
          sizeAttenuation={true}
        />
      </sprite>
    </group>
  )
}

function createLabelCanvas(text: string, state: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64

  const context = canvas.getContext('2d')
  if (!context) return canvas

  // Background
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Border
  context.strokeStyle = stateColors[state as keyof typeof stateColors]
  context.lineWidth = 2
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

  // Text
  context.fillStyle = stateColors[state as keyof typeof stateColors]
  context.font = 'bold 32px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, 32)

  return canvas
}
