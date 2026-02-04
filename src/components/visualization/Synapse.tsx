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

  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [from, to])

  useFrame(() => {
    if (materialRef.current) {
      const targetOpacity = active ? 0.8 : 0.3
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1
    }
  })

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={active ? '#06b6d4' : '#7c3aed'}
        linewidth={2}
        transparent
        opacity={active ? 0.8 : 0.3}
      />
    </line>
  )
}
