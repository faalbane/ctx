import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { HubNode } from './HubNode'
import { ProjectNode } from './ProjectNode'
import { Synapse } from './Synapse'
import type { Project } from '../../stores/useProjectStore'

interface NeuralCanvasProps {
  projects: Project[]
}

export function NeuralCanvas({ projects }: NeuralCanvasProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom
          enablePan
          minDistance={10}
          maxDistance={100}
        />

        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Central hub node */}
          <HubNode />

          {/* Project nodes arranged in a circle */}
          {projects.map((project, index) => {
            const angle = (index / projects.length) * Math.PI * 2
            const radius = 10
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius

            return (
              <group key={project.id}>
                <ProjectNode
                  position={[x, 0, z]}
                  project={project}
                />
                {/* Synapse connection from hub to project */}
                <Synapse
                  from={[0, 0, 0]}
                  to={[x, 0, z]}
                  active={false}
                />
              </group>
            )
          })}
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      {projects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <div className="text-lg text-neural-cyan mb-2">Loading projects...</div>
            <div className="text-sm text-gray-500">Scanning ~/.claude/projects</div>
          </div>
        </div>
      )}
    </div>
  )
}
