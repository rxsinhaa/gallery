"use client";

import { useEffect, useState } from "react";
import Gallery from "@/components/Gallery";

export default function Home() {
  const [hearts, setHearts] = useState<Array<{ id: number, left: number, color: string, duration: number }>>([]);

  // Floating Hearts Animation Config
  useEffect(() => {
    const colors = ["#f6aca2", "#f49b90", "#f28b7d", "#f07a6a", "#ee6352"];

    // Create initial batch
    const createHeart = (id: number) => ({
      id,
      left: Math.random() * 100, // vw
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 6 + 4, // 4-10s
    });

    const initialHearts = Array.from({ length: 15 }).map((_, i) => createHeart(i));
    setHearts(initialHearts);

    const interval = setInterval(() => {
      setHearts(prev => {
        // Remove old ones? Or just cycle. 
        // Simple implementation: Keep adding/removing to simulate flow.
        // For simplicity in CSS animation, we just render them and let CSS loop or Keyframes handle it.
        // But for distinct random paths, unique elements are better.
        // Let's just create a static set with random delays and infinite CSS animations.
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Background Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-4xl opacity-50"
            style={{
              left: `${heart.left}%`,
              color: heart.color,
              bottom: "-10vh",
              animation: `floatUp ${heart.duration}s linear infinite`,
              animationDelay: `-${Math.random() * 10}s`, // Start at random times
            }}
          >
            ♥
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            bottom: -10vh;
            opacity: 0;
            transform: scale(0.5) translateY(0);
          }
          10% {
            opacity: 0.8;
          }
          100% {
            bottom: 110vh;
            opacity: 0;
            transform: scale(1.2) translateY(0); /* translateY handled by bottom, kept scale */
          }
        }
      `}</style>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none select-none">
        {/* Header Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-shadows" style={{ fontFamily: 'var(--font-bungee)', color: '#f6aca2' }}>
          OUR MEMORIES
        </h1>
        <p className="text-lg text-[#f6aca2] opacity-80 font-[family-name:var(--font-bungee)]">
          Click a photo to relive the moment
        </p>
      </div>

      <div className="w-full h-full">
        <Gallery />
      </div>
    </main>
  );
}
