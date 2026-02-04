import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { HubNode } from './HubNode'
import { ProjectNode } from './ProjectNode'
import { ThreadNode } from './ThreadNode'
import { LiveSessionNode } from './LiveSessionNode'
import { Synapse } from './Synapse'
import { useProjectStore } from '../../stores/useProjectStore'
import { useThreadStore } from '../../stores/useThreadStore'
import { useLiveSessionStore } from '../../stores/useLiveSessionStore'
import type { Project } from '../../stores/useProjectStore'

interface NeuralCanvasProps {
  projects: Project[]
}

export function NeuralCanvas({ projects }: NeuralCanvasProps) {
  const { selectedProjectId } = useProjectStore()
  const { threads } = useThreadStore()
  const { sessions } = useLiveSessionStore()

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const liveSessions = selectedProject ? sessions.filter(s => s.projectId === selectedProject.id) : []

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

                {/* Thread nodes and live sessions for selected project */}
                {isSelected && (threads.length > 0 || liveSessions.length > 0) && (
                  <>
                    {/* Historical thread nodes */}
                    {threads.map((thread, threadIndex) => {
                      const totalNodes = threads.length + liveSessions.length
                      const threadAngle = (threadIndex / Math.max(totalNodes, 1)) * Math.PI * 2
                      const threadRadius = 6
                      const tx = x + Math.cos(threadAngle) * threadRadius
                      const tz = z + Math.sin(threadAngle) * threadRadius
                      const ty = Math.sin(threadAngle) * 2

                      return (
                        <group key={`thread-${thread.id}`}>
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

                    {/* Live session nodes */}
                    {liveSessions.map((session, sessionIndex) => {
                      const totalNodes = threads.length + liveSessions.length
                      const sessionAngle = ((threads.length + sessionIndex) / Math.max(totalNodes, 1)) * Math.PI * 2
                      const sessionRadius = 6
                      const sx = x + Math.cos(sessionAngle) * sessionRadius
                      const sz = z + Math.sin(sessionAngle) * sessionRadius
                      const sy = Math.sin(sessionAngle) * 2

                      return (
                        <group key={`session-${session.id}`}>
                          <LiveSessionNode
                            position={[sx, sy, sz]}
                            sessionId={session.id}
                            state={session.state}
                          />
                          {/* Synapse from project to live session */}
                          <Synapse
                            from={[x, 0, z]}
                            to={[sx, sy, sz]}
                            active={true}
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
        {selectedProject && (
          <>
            <div>Threads: {threads.length}</div>
            {liveSessions.length > 0 && (
              <div className="text-neural-cyan">Live Sessions: {liveSessions.length}</div>
            )}
          </>
        )}
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
