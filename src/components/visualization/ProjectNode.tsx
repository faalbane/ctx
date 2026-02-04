import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useProjectStore } from '../../stores/useProjectStore'
import type { Project } from '../../stores/useProjectStore'

interface ProjectNodeProps {
  position: [number, number, number]
  project: Project
}

export function ProjectNode({ position, project }: ProjectNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { selectProject } = useProjectStore()

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group position={position}>
      {/* Project node */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => selectProject(project.id)}
      >
        <octahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color={hovered ? '#06b6d4' : '#3b82f6'}
          emissive={hovered ? '#06b6d4' : '#3b82f6'}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Highlight ring on hover */}
      {hovered && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          <octahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#06b6d4"
            transparent
            opacity={0.2}
            emissive="#06b6d4"
          />
        </mesh>
      )}
    </group>
  )
}
