import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { HubNode } from './HubNode'
import { ProjectNode } from './ProjectNode'
import { ThreadNode } from './ThreadNode'
import { Synapse } from './Synapse'
import { useProjectStore } from '../../stores/useProjectStore'
import { useThreadStore } from '../../stores/useThreadStore'
import type { Project } from '../../stores/useProjectStore'

interface NeuralCanvasProps {
  projects: Project[]
}

export function NeuralCanvas({ projects }: NeuralCanvasProps) {
  const { selectedProjectId } = useProjectStore()
  const { threads } = useThreadStore()

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={1.5}
          enableZoom
          enablePan
          minDistance={10}
          maxDistance={150}
        />

        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />
          <pointLight position={[0, 10, -10]} intensity={0.3} color="#06b6d4" />

          {/* Central hub node */}
          <HubNode />

          {/* Project nodes arranged in a circle */}
          {projects.map((project, index) => {
            const angle = (index / Math.max(projects.length, 1)) * Math.PI * 2
            const radius = 10
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const isSelected = project.id === selectedProjectId

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
                  active={isSelected}
                />

                {/* Thread nodes for selected project */}
                {isSelected && threads.length > 0 && (
                  <>
                    {threads.map((thread, threadIndex) => {
                      const threadAngle = (threadIndex / threads.length) * Math.PI * 2
                      const threadRadius = 5
                      const tx = x + Math.cos(threadAngle) * threadRadius
                      const tz = z + Math.sin(threadAngle) * threadRadius
                      const ty = Math.sin(threadAngle) * 2

                      return (
                        <group key={thread.id}>
                          <ThreadNode
                            position={[tx, ty, tz]}
                            thread={thread}
                          />
                          {/* Synapse from project to thread */}
                          <Synapse
                            from={[x, 0, z]}
                            to={[tx, ty, tz]}
                            active={false}
                          />
                        </group>
                      )
                    })}
                  </>
                )}
              </group>
            )
          })}
        </Suspense>
      </Canvas>

      {/* Info display */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-black/50 px-3 py-2 rounded">
        <div>Projects: {projects.length}</div>
        {selectedProject && <div>Threads: {threads.length}</div>}
      </div>

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
