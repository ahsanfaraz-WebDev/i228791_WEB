"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  PresentationControls,
  Text,
  Html,
  useProgress,
  Environment,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { gsap } from "gsap";
import {
  Group,
  Vector3,
  MathUtils,
  Matrix4,
  InstancedMesh,
  Mesh,
  Color,
} from "three";

// Brand colors for consistent theme across app
const BRAND_COLORS = {
  primary: "#3B82F6", // blue-500
  secondary: "#6366F1", // indigo-500
  accent: "#8B5CF6", // violet-500
  light: "#F8FAFC", // slate-50
  dark: "#1E293B", // slate-800
  text: "#0F172A", // slate-900
  textLight: "#94A3B8", // slate-400
  background: "#FFFFFF", // white
  backgroundDark: "#0F172A", // slate-900
};

// Loading screen for 3D models
function Loader() {
  const { progress } = useProgress();
  const [showMessage, setShowMessage] = useState(false);

  // Use useEffect to defer state updates to avoid updates during render
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        setShowMessage(true);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-indigo-600 animate-ping opacity-20"></div>
        </div>
        {showMessage && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-blue-600 text-sm font-medium">
              {Math.floor(progress)}% loaded
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Loading interactive 3D model...
            </p>
          </div>
        )}
      </div>
    </Html>
  );
}

interface Particle {
  position: Vector3;
  scale: number;
  speed: number;
}

// Animated background particles
function Particles({ count = 150, color = BRAND_COLORS.primary }) {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (!meshRef.current) return;

    particles.current = Array.from({ length: count }).map(() => ({
      position: new Vector3(
        MathUtils.randFloatSpread(15),
        MathUtils.randFloatSpread(15),
        MathUtils.randFloatSpread(15)
      ),
      scale: MathUtils.randFloat(0.05, 0.2),
      speed: MathUtils.randFloat(0.005, 0.02),
    }));
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    const matrix = new Matrix4();

    for (let i = 0; i < count; i++) {
      const particle = particles.current[i];
      if (!particle) continue;

      const { position, scale, speed } = particle;

      // Subtle movement
      position.y -= speed;
      position.x += Math.sin(position.y * 0.1) * 0.005;

      // Reset position when out of view
      if (position.y < -7) position.y = 7;

      // Update instance matrices
      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(position);
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
}

function InteractiveBook() {
  const groupRef = useRef<Group>(null);
  const coverRef = useRef<Mesh>(null);
  const pagesRef = useRef<Mesh>(null);
  const textRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  // Subtle ambient animation only when not being interacted with
  useFrame(({ clock }) => {
    if (groupRef.current && !mouseOver) {
      // Very subtle floating effect
      groupRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  // Visual feedback on hover/interaction
  useEffect(() => {
    if (!groupRef.current) return;

    if (hovered) {
      gsap.to(groupRef.current.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });

      // Small opening animation for the book cover
      if (coverRef.current) {
        gsap.to(coverRef.current.rotation, {
          z: -0.2,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    } else {
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Close the book
      if (coverRef.current) {
        gsap.to(coverRef.current.rotation, {
          z: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }
  }, [hovered]);

  return (
    <group
      ref={groupRef}
      onPointerOver={() => {
        setHovered(true);
        setMouseOver(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        setMouseOver(false);
      }}
    >
      {/* Book shadow */}
      <mesh
        position={[0, -1.5, -0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[3, 3, 1]}
      >
        <planeGeometry />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>

      {/* Book cover with rounded edges */}
      <RoundedBox
        ref={coverRef}
        position={[0, 0, 0]}
        scale={[2, 3, 0.2]}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial
          color={BRAND_COLORS.primary}
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {/* Book pages with rounded edges */}
      <RoundedBox
        position={[0, 0, -0.1]}
        scale={[1.9, 2.9, 0.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial color={BRAND_COLORS.light} roughness={0.5} />
      </RoundedBox>

      {/* Cover decoration */}
      <RoundedBox
        position={[0, 1, 0.11]}
        scale={[1.6, 0.2, 0.05]}
        radius={0.02}
        smoothness={4}
      >
        <meshStandardMaterial color={BRAND_COLORS.accent} />
      </RoundedBox>

      <RoundedBox
        position={[0, -1, 0.11]}
        scale={[1.6, 0.2, 0.05]}
        radius={0.02}
        smoothness={4}
      >
        <meshStandardMaterial color={BRAND_COLORS.accent} />
      </RoundedBox>

      {/* Glowing text */}
      <group ref={textRef} position={[0, 0, 0.15]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.4}
          color={BRAND_COLORS.light}
          anchorX="center"
          anchorY="middle"
          outlineColor={BRAND_COLORS.secondary}
          outlineWidth={0.02}
        >
          EduSphere
        </Text>

        <Text
          position={[0, -0.2, 0]}
          fontSize={0.15}
          color={BRAND_COLORS.light}
          anchorX="center"
          anchorY="middle"
        >
          Interactive Learning
        </Text>
      </group>

      {/* Sparkles for visual flair, only visible on hover */}
      {hovered && (
        <Sparkles
          count={20}
          scale={[3, 4, 3]}
          position={[0, 0, 1]}
          size={2}
          speed={0.3}
          color={BRAND_COLORS.secondary}
        />
      )}

      {/* Subtle glow effect */}
      <pointLight
        position={[0, 0, 2]}
        color={BRAND_COLORS.primary}
        intensity={0.8}
        distance={5}
        decay={2}
      />
    </group>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  useEffect(() => {
    // Staggered animation sequence for the elements
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (textRef.current && subTextRef.current && buttonContainerRef.current) {
      tl.from(textRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
      })
        .from(
          subTextRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          buttonContainerRef.current.children,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
          },
          "-=0.4"
        );
    }

    // Canvas container animation
    if (canvasContainerRef.current) {
      gsap.from(canvasContainerRef.current, {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        delay: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Enhanced decorative background elements */}
      <div className="absolute top-24 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-12 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <h1
              ref={textRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400"
            >
              Transform Your Learning Journey
            </h1>
            <p
              ref={subTextRef}
              className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-[600px] leading-relaxed"
            >
              Discover an immersive educational platform where{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                interactive courses
              </span>
              ,{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                expert tutors
              </span>
              , and{" "}
              <span className="text-violet-600 dark:text-violet-400 font-medium">
                AI-powered tools
              </span>{" "}
              converge to create personalized learning experiences.
            </p>
            <div
              ref={buttonContainerRef}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-lg font-medium px-8 py-6"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-full border-blue-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all duration-300 text-lg font-medium px-8 py-6"
              >
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Join over 10,000 students already learning with us
            </p>
          </div>
          <div
            ref={canvasContainerRef}
            className="h-[500px] md:h-[600px] transition-all duration-500 transform"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-900/80 shadow-xl border border-blue-100 dark:border-blue-900/30">
              {/* Instructional overlay hint */}
              <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-slate-600 dark:text-slate-300 z-10 shadow-md border border-slate-200 dark:border-slate-700 pointer-events-none">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>Drag to interact with 3D model</span>
                </div>
              </div>

              <Canvas
                camera={{ position: [0, 0, 8], fov: 30 }}
                onCreated={() => setCanvasLoaded(true)}
                gl={{ antialias: true }}
                dpr={[1, 2]}
                shadows
              >
                <Suspense fallback={<Loader />}>
                  <ambientLight intensity={0.5} />
                  <spotLight
                    position={[5, 10, 10]}
                    angle={0.25}
                    penumbra={1}
                    intensity={0.7}
                    castShadow
                  />

                  {/* Soft color accent lights */}
                  <pointLight
                    position={[-5, 5, 5]}
                    color={BRAND_COLORS.primary}
                    intensity={0.5}
                  />
                  <pointLight
                    position={[5, -5, 5]}
                    color={BRAND_COLORS.accent}
                    intensity={0.5}
                  />

                  <PresentationControls
                    global
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 3, Math.PI / 3]}
                    speed={1.5}
                    zoom={1}
                    snap
                  >
                    <InteractiveBook />
                  </PresentationControls>

                  {/* Particles in the background */}
                  <Particles count={150} color={BRAND_COLORS.primary} />

                  <ContactShadows
                    opacity={0.4}
                    scale={10}
                    blur={3}
                    position={[0, -1.5, 0]}
                    far={4}
                  />

                  {/* Enhanced environment lighting */}
                  <Environment preset="city" background={false}>
                    <Suspense fallback={null}>
                      {/* This creates a clear separation between Environment loading and the Progress component */}
                    </Suspense>
                  </Environment>
                </Suspense>
              </Canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
