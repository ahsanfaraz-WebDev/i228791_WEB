"use client";

import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Float,
  PresentationControls,
  Html,
  Text,
  useProgress,
} from "@react-three/drei";
import { gsap } from "gsap";
import { Vector3, MathUtils, Group } from "three";

// Loading screen for 3D models
function Loader() {
  const { progress } = useProgress();

  // Using useMemo to derive the value rather than setting state during render
  const displayProgress = useMemo(() => {
    return Math.floor(progress);
  }, [progress]);

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-primary text-sm mt-4 font-medium">
          {displayProgress}% loaded
        </p>
      </div>
    </Html>
  );
}

function FloatingBook(props: any) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Reset rotation
      groupRef.current.rotation.set(0, 0, 0);

      // Create more organic floating animation
      gsap.to(groupRef.current.position, {
        y: "+=0.3",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Subtle rotation
      gsap.to(groupRef.current.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      // Add a slight wobble for more organic movement
      gsap.to(groupRef.current.rotation, {
        x: 0.05,
        z: 0.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  return (
    <group {...props} ref={groupRef}>
      {/* Book cover */}
      <mesh position={[0, 0, 0]} scale={[1.5, 2.2, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Book pages */}
      <mesh position={[0, 0, -0.08]} scale={[1.4, 2.1, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <Text
        position={[0, 0.4, 0.1]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        EduSphere
      </Text>
    </group>
  );
}

function FloatingCourseCards() {
  const cardsRef = useRef<Group>(null);
  const [cards] = useState(() => {
    // Create different colored cards in a circular pattern
    return [...Array(5)].map((_, i) => ({
      id: i,
      color: [
        "#4285F4", // Google Blue
        "#EA4335", // Google Red
        "#FBBC05", // Google Yellow
        "#34A853", // Google Green
        "#8334A2", // Google Purple
      ][i],
      x: Math.cos((i / 5) * Math.PI * 2) * 2,
      z: Math.sin((i / 5) * Math.PI * 2) * 2,
      y: 0,
      rotation: (i / 5) * Math.PI * 2,
      scale: [1.2, 0.1, 1.6] as [number, number, number],
    }));
  });

  useEffect(() => {
    if (cardsRef.current) {
      // Create staggered animation for cards group
      gsap.from(cardsRef.current.position, {
        y: -3,
        duration: 1.2,
        ease: "power3.out",
      });

      // Add a subtle floating animation to the entire group
      gsap.to(cardsRef.current.rotation, {
        y: Math.PI * 2,
        duration: 30,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  return (
    <group ref={cardsRef}>
      {cards.map((card) => (
        <mesh
          key={card.id}
          position={[card.x, card.y, card.z]}
          rotation={[0, card.rotation, 0]}
        >
          <boxGeometry args={card.scale} />
          <meshStandardMaterial
            color={card.color}
            metalness={0.1}
            roughness={0.8}
          />
          <Text
            position={[0, 0.11, 0.01]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Course {card.id + 1}
          </Text>
        </mesh>
      ))}
    </group>
  );
}

export function Dashboard3D() {
  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.6} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={0.5}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.2} />

          {/* Add hemispheric light for better color distribution */}
          <hemisphereLight args={[0x4285f4, 0x8334a2, 0.6]} />

          <PresentationControls
            global
            rotation={[0, -Math.PI / 6, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <Float rotationIntensity={0.5} floatIntensity={0.5}>
              <FloatingBook position={[0, 1, 0]} />
              <FloatingCourseCards />
            </Float>
          </PresentationControls>

          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2.5}
            far={4}
          />
        </Suspense>
      </Canvas>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-blue-500/10 blur-xl"></div>
        <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"></div>
      </div>
    </div>
  );
}

export function LearningStats() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    barRefs.current.forEach((bar, index) => {
      if (bar) {
        gsap.from(bar, {
          width: 0,
          duration: 1.5,
          delay: index * 0.2,
          ease: "power3.out",
        });
      }
    });
  }, []);

  const stats = [
    { label: "Course Completion", value: 78, color: "#4285F4" }, // Google Blue
    { label: "Quiz Performance", value: 92, color: "#EA4335" }, // Google Red
    { label: "Engagement", value: 65, color: "#34A853" }, // Google Green
    { label: "Practice Problems", value: 85, color: "#FBBC05" }, // Google Yellow
  ];

  const setBarRef = (index: number) => (el: HTMLDivElement | null) => {
    barRefs.current[index] = el;
  };

  return (
    <div className="space-y-6 p-1">
      {stats.map((stat, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{stat.label}</span>
            <span className="text-sm font-medium">{stat.value}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
            <div
              ref={setBarRef(index)}
              className="h-3 rounded-full transition-all duration-1000"
              style={{ width: `${stat.value}%`, backgroundColor: stat.color }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, description, color }: any) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border p-6 hover:shadow-lg transition-all duration-300"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          backgroundImage: `linear-gradient(45deg, ${color}40, transparent)`,
        }}
      />
      <div
        className={`inline-flex rounded-xl p-3 mb-4`}
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
