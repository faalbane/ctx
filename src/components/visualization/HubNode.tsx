import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function HubNode() {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003
      meshRef.current.rotation.y += 0.005
    }
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.001
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          wireframe={false}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.1}
          emissive="#06b6d4"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  )
}
