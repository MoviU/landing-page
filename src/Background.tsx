import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './Background.css';

// --- Configuration ---
const GLOW_COUNT = 15; // Increased from 8 to 15
const X_RANGE = 1000;  // How far left/right they can fly (px)
const Y_RANGE = 1200;  // How far up/down they can fly (px) - covers vertical height
const MIN_DURATION = 30;
const MAX_DURATION = 50;

// Helper to get a random number between min and max
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Helper to generate a random path array
// We ensure the last point equals the first point for a seamless loop
const generateRandomPath = (range: number, steps: number) => {
  const path = Array.from({ length: steps }, () => random(-range, range));
  path.push(path[0]); // Close the loop
  return path;
};

const Background = () => {
  // We use useMemo to generate these random paths once on mount.
  // This prevents the glows from jumping to new random paths on every re-render.
  const glows = useMemo(() => {
    return Array.from({ length: GLOW_COUNT }).map((_, i) => {
      
      // 1. Create random motion paths covering the whole screen
      const xPath = generateRandomPath(X_RANGE, 8); 
      const yPath = generateRandomPath(Y_RANGE, 8); 

      // 2. Randomize timing so they don't move in sync
      const duration = random(MIN_DURATION, MAX_DURATION);
      
      // 3. Large negative delay for "Pre-warming" (instant smooth movement)
      const delay = -random(0, duration); 

      return {
        id: i,
        colorClass: `glow-${(i % 4) + 1}`, // Cycles through glow-1, glow-2, etc.
        variants: {
          initial: { 
            opacity: 0, 
            scale: 0.5 
          },
          animate: {
            opacity: 1,
            x: xPath,
            y: yPath,
            scale: [1, 1.2, 0.8, 1.1, 0.9, 1.15, 0.85, 1.05, 1], // Breathing effect
            transition: {
              // Movement Transitions
              x: {
                duration,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                delay, 
              },
              y: {
                duration,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                delay,
              },
              // Breathing Transitions
              scale: {
                duration: duration * 0.8, // Slightly faster than movement for organic feel
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                delay,
              },
              // Entrance Fade-in
              opacity: {
                duration: 2,
                ease: 'easeOut',
              }
            },
          },
        }
      };
    });
  }, []); // Empty dependency array = runs once on mount

  return (
    <div className="aurora-container">
      {glows.map((glow) => (
        <motion.div
          key={glow.id}
          className={`aurora-glow ${glow.colorClass}`}
          variants={glow.variants}
          initial="initial"
          animate="animate"
        />
      ))}

      {/* The Dark Overlay */}
      <div className="dark-overlay"></div>
    </div>
  );
};

export default Background;