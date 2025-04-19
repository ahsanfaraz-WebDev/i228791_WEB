"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create a group for all objects
    const group = new THREE.Group()
    scene.add(group)

    // Create floating education-themed objects
    const geometry1 = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    const material1 = new THREE.MeshNormalMaterial()
    const torusKnot = new THREE.Mesh(geometry1, material1)
    torusKnot.position.set(2, 0, 0)
    group.add(torusKnot)

    const geometry2 = new THREE.IcosahedronGeometry(0.8, 0)
    const material2 = new THREE.MeshNormalMaterial()
    const icosahedron = new THREE.Mesh(geometry2, material2)
    icosahedron.position.set(-2, 1, -1)
    group.add(icosahedron)

    const geometry3 = new THREE.OctahedronGeometry(0.6, 0)
    const material3 = new THREE.MeshNormalMaterial()
    const octahedron = new THREE.Mesh(geometry3, material3)
    octahedron.position.set(0, -1.5, 1)
    group.add(octahedron)

    // Position camera
    camera.position.z = 5

    // Add orbit controls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate objects
      torusKnot.rotation.x += 0.01
      torusKnot.rotation.y += 0.01

      icosahedron.rotation.x += 0.005
      icosahedron.rotation.y += 0.01

      octahedron.rotation.x += 0.01
      octahedron.rotation.z += 0.005

      // Rotate entire group slowly
      group.rotation.y += 0.002

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      // Clean up resources
      geometry1.dispose()
      material1.dispose()
      geometry2.dispose()
      material2.dispose()
      geometry3.dispose()
      material3.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10" />
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <motion.h1
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Transform Education with Interactive Learning
              </motion.h1>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join our platform where teachers create engaging courses and students learn with AI-enhanced videos and
                real-time interaction.
              </motion.p>
            </div>
            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/signup?role=student">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Join as Student
                </Button>
              </Link>
              <Link href="/signup?role=teacher">
                <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                  Become a Teacher
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
