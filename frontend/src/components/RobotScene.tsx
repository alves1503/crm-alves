import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'

interface RobotSceneProps {
  passwordVisible: boolean
}

export function RobotScene({ passwordVisible }: RobotSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const eyesOpenRef = useRef(passwordVisible)
  const [webglUnavailable, setWebglUnavailable] = useState(false)

  useEffect(() => {
    eyesOpenRef.current = passwordVisible
  }, [passwordVisible])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let cleanupScene: (() => void) | undefined

    async function initializeScene(target: HTMLDivElement) {
      let THREE: typeof import('three')
      try {
        THREE = await import('three')
      } catch (cause) {
        console.error('Não foi possível carregar a ilustração 3D; exibindo a versão alternativa.', cause)
        if (!cancelled) setWebglUnavailable(true)
        return
      }
      if (cancelled) return

      let renderer: THREE.WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      } catch (cause) {
        console.error('Não foi possível inicializar a ilustração 3D; exibindo a versão alternativa.', cause)
        if (!cancelled) setWebglUnavailable(true)
        return
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      target.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      camera.position.set(0, 0.05, 7)

      scene.add(new THREE.HemisphereLight(0xffffff, 0x858582, 2))
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
      keyLight.position.set(-3, 4, 6)
      scene.add(keyLight)
      const rimLight = new THREE.PointLight(0xd7d3ca, 8, 12)
      rimLight.position.set(3, 1.5, 2)
      scene.add(rimLight)

      const robot = new THREE.Group()
      robot.position.x = 0.32
      robot.scale.setScalar(0.92)
      scene.add(robot)

      const shellMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e7e2,
        metalness: 0.06,
        roughness: 0.34,
      })
      const trimMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8b8b3,
        metalness: 0.12,
        roughness: 0.38,
      })
      const visorMaterial = new THREE.MeshStandardMaterial({
        color: 0x34383a,
        metalness: 0.16,
        roughness: 0.28,
      })
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xd6d5d0,
        emissive: 0x777772,
        emissiveIntensity: 0.32,
        roughness: 0.3,
      })

      const createRoundedPanel = (width: number, height: number, radius: number, depth = 0.06) => {
        const shape = new THREE.Shape()
        shape.moveTo(-width / 2 + radius, -height / 2)
        shape.lineTo(width / 2 - radius, -height / 2)
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius)
        shape.lineTo(width / 2, height / 2 - radius)
        shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2)
        shape.lineTo(-width / 2 + radius, height / 2)
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius)
        shape.lineTo(-width / 2, -height / 2 + radius)
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2)
        return new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.018,
          bevelThickness: 0.018,
        })
      }

      const head = new THREE.Group()
      head.position.y = 0.38
      robot.add(head)
      const headShell = new THREE.Mesh(createRoundedPanel(1.42, 0.96, 0.32, 0.42), shellMaterial)
      headShell.position.z = -0.34
      head.add(headShell)

      const visor = new THREE.Mesh(createRoundedPanel(1.12, 0.4, 0.19), visorMaterial)
      visor.position.set(0, -0.02, 0.08)
      head.add(visor)

      const eyes: THREE.Mesh[] = []
      const eyeBasePositions: THREE.Vector3[] = []
      for (const x of [-0.26, 0.26]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), eyeMaterial)
        eye.position.set(x, 0, 0.148)
        eye.scale.set(1, 0.72, 0.42)
        eye.scale.y = eyesOpenRef.current ? 0.72 : 0.08
        head.add(eye)
        eyes.push(eye)
        eyeBasePositions.push(eye.position.clone())
      }

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.25, 32), trimMaterial)
      neck.position.y = -0.31
      robot.add(neck)

      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.49, 0.55, 10, 32), shellMaterial)
      torso.scale.set(1.15, 1.04, 0.86)
      torso.position.y = -1.2
      robot.add(torso)

      const chestMark = new THREE.Mesh(createRoundedPanel(0.3, 0.13, 0.06), trimMaterial)
      chestMark.position.set(0, -1.2, 0.39)
      robot.add(chestMark)

      const armGeometry = new THREE.CapsuleGeometry(0.095, 0.32, 6, 16)
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(armGeometry, shellMaterial)
        arm.position.set(side * 0.6, -1.08, 0.2)
        arm.rotation.z = -side * 0.2
        robot.add(arm)
      }

      const resizeObserver = new ResizeObserver(() => {
        const width = target.clientWidth
        const height = target.clientHeight
        if (!width || !height) return
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      })
      resizeObserver.observe(target)

      const pointer = new THREE.Vector2()
      const handlePointerMove = (event: PointerEvent) => {
        const bounds = target.getBoundingClientRect()
        pointer.x = THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1)
        pointer.y = THREE.MathUtils.clamp(1 - ((event.clientY - bounds.top) / bounds.height) * 2, -1, 1)
      }
      const resetPointer = () => pointer.set(0, 0)
      target.addEventListener('pointermove', handlePointerMove)
      target.addEventListener('pointerleave', resetPointer)

      let animationFrame = 0
      const clock = new THREE.Clock()
      let nextBlinkAt = 2.8
      let blinkStartedAt = -1
      const animate = () => {
        const elapsed = clock.getElapsedTime()
        robot.position.y = -0.12 + Math.sin(elapsed * 0.75) * 0.035
        robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, pointer.x * 0.035, 0.035)
        robot.rotation.z = THREE.MathUtils.lerp(robot.rotation.z, -pointer.x * 0.008, 0.035)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, pointer.x * 0.07 + Math.sin(elapsed * 0.35) * 0.01, 0.05)
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -pointer.y * 0.045, 0.05)
        if (eyesOpenRef.current && blinkStartedAt < 0 && elapsed >= nextBlinkAt) {
          blinkStartedAt = elapsed
        }
        if (blinkStartedAt >= 0 && elapsed - blinkStartedAt > 0.2) {
          blinkStartedAt = -1
          nextBlinkAt = elapsed + 2.4 + Math.random() * 2.6
        }
        const blinkProgress = blinkStartedAt < 0 ? 1 : Math.min((elapsed - blinkStartedAt) / 0.1, 1, (0.2 - (elapsed - blinkStartedAt)) / 0.1)
        const eyeScale = eyesOpenRef.current ? 0.72 * Math.max(0.08, blinkProgress) : 0.08
        for (let index = 0; index < eyes.length; index += 1) {
          const eye = eyes[index]
          eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, eyeScale, 0.16)
          eye.position.x = THREE.MathUtils.lerp(eye.position.x, eyeBasePositions[index].x + pointer.x * 0.016, 0.08)
          eye.position.y = THREE.MathUtils.lerp(eye.position.y, eyeBasePositions[index].y + pointer.y * 0.01, 0.08)
        }
        renderer.render(scene, camera)
        animationFrame = window.requestAnimationFrame(animate)
      }
      animate()

      cleanupScene = () => {
        window.cancelAnimationFrame(animationFrame)
        target.removeEventListener('pointermove', handlePointerMove)
        target.removeEventListener('pointerleave', resetPointer)
        resizeObserver.disconnect()
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    void initializeScene(host)
    return () => {
      cancelled = true
      cleanupScene?.()
    }
  }, [])

  return (
    <div className={`robot-canvas ${webglUnavailable ? 'robot-canvas-fallback' : ''}`} ref={hostRef} role="img" aria-label={passwordVisible ? 'Robô com os olhos abertos' : 'Robô com os olhos fechados'}>
      {webglUnavailable && (
        <div className={`fallback-robot ${passwordVisible ? 'fallback-robot-awake' : ''}`}>
          <span className="fallback-arm fallback-arm-left" />
          <span className="fallback-arm fallback-arm-right" />
          <span className="fallback-head"><i /><i /></span>
          <span className="fallback-body"><i /></span>
        </div>
      )}
    </div>
  )
}
