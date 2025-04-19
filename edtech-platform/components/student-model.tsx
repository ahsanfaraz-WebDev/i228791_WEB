"use client";

import { useRef, useEffect } from "react";
import type * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useFrame } from "@react-three/fiber";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ContactShadows,
  Suspense,
} from "@react-three/drei";

function GraduationCap(props: any) {
  const { scene } = useGLTF("/assets/3d/duck.glb"); // Using duck as placeholder
  const ref = useRef<THREE.Group>(null);

  // Animation
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      ref.current.position.y =
        Math.sin(state.clock.getElapsedTime()) * 0.1 + 0.1;
    }
  });

  return (
    <group {...props}>
      <primitive ref={ref} object={scene} scale={2} position={[0, -0.5, 0]} />
    </group>
  );
}

function CameraController() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
}

export function StudentModel() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <GraduationCap />
        <CameraController />
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={5}
          blur={2.4}
        />
        <Suspense fallback={null}>
          <Environment preset="city" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
