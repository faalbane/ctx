import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useThreadStore, type Thread } from '../../stores/useThreadStore'

interface ThreadNodeProps {
  position: [number, number, number]
  thread: Thread
}

export function ThreadNode({ position, thread }: ThreadNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectThread } = useThreadStore()

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.2 : 0.8
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={position}>
      {/* Thread node - smaller than project nodes */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => selectThread(thread.id)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#06b6d4' : '#3b82f6'}
          emissive={hovered ? '#06b6d4' : '#3b82f6'}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Highlight on hover */}
      {hovered && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#06b6d4"
            transparent
            opacity={0.15}
            emissive="#06b6d4"
          />
        </mesh>
      )}
    </group>
  )
}
