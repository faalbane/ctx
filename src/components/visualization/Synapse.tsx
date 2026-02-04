import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SynapseProps {
  from: [number, number, number]
  to: [number, number, number]
  active?: boolean
}

export function Synapse({ from, to, active = false }: SynapseProps) {
  const lineRef = useRef<THREE.Line>(null)
  const materialRef = useRef<THREE.LineBasicMaterial>(null)
  const tubeRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [from, to])

  const tubeGeometry = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to)
    )
    return new THREE.TubeGeometry(curve, 8, 0.05, 3)
  }, [from, to])

  useFrame((state) => {
    timeRef.current += state.delta

    if (materialRef.current) {
      const targetOpacity = active ? 0.9 : 0.25
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1

      // Pulsing effect when active
      if (active) {
        materialRef.current.opacity *= 0.8 + 0.2 * Math.sin(timeRef.current * 3)
      }
    }

    if (tubeRef.current && tubeRef.current.material) {
      const material = tubeRef.current.material as THREE.MeshStandardMaterial
      const targetOpacity = active ? 0.4 : 0.05
      material.opacity += (targetOpacity - material.opacity) * 0.1

      if (active) {
        material.emissiveIntensity = 0.5 + 0.5 * Math.sin(timeRef.current * 2)
      } else {
        material.emissiveIntensity = 0
      }
    }
  })

  return (
    <group>
      {/* Glowing tube for active connections */}
      {active && (
        <mesh ref={tubeRef} geometry={tubeGeometry}>
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Main line */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color={active ? '#06b6d4' : '#7c3aed'}
          linewidth={active ? 3 : 2}
          transparent
          opacity={active ? 0.9 : 0.3}
        />
      </line>
    </group>
  )
}
