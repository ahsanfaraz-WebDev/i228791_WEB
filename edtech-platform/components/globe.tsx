"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 200

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(80, 64, 64)

    // Earth material with basic texture
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2194ce,
      emissive: 0x112244,
      specular: 0xbbbbbb,
      shininess: 5,
      transparent: true,
      opacity: 0.8,
    })

    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    scene.add(earth)

    // Add atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(82, 64, 64)
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4ca1af,
      emissive: 0x4ca1af,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)

    // Add points representing locations
    const pointsGroup = new THREE.Group()
    scene.add(pointsGroup)

    // Create 50 random points on the globe
    for (let i = 0; i < 50; i++) {
      const phi = Math.acos(-1 + (2 * i) / 50)
      const theta = Math.sqrt(50 * Math.PI) * phi

      const pointGeometry = new THREE.SphereGeometry(0.8, 16, 16)
      const pointMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x4ade80),
      })
      const point = new THREE.Mesh(pointGeometry, pointMaterial)

      point.position.x = 80 * Math.sin(phi) * Math.cos(theta)
      point.position.y = 80 * Math.sin(phi) * Math.sin(theta)
      point.position.z = 80 * Math.cos(phi)

      pointsGroup.add(point)
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
