import React from 'react';
// Import the motion object from framer-motion
import { motion } from 'framer-motion';
import './Background.css';

// Define the animation properties outside the component for clean code
const glowAnimation = (delay: number) => ({
  initial: {
    x: '0%',
    y: '0%',
    scale: 1,
    rotate: '0deg',
  },
  animate: {
    // Defines the end state of the loop
    x: ['0%', '20%', '-10%', '0%'], // Complex X movement
    y: ['0%', '-30%', '10%', '0%'], // Complex Y movement
    scale: [1, 1.1, 0.95, 1], // Subtle pulsing scale
    rotate: ['0deg', '5deg', '-5deg', '0deg'], // Subtle rotation

    // Animation options
    transition: {
      duration: 10,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
    },
  },
});

const Background = ({ children }) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div className="aurora-container">
        {/* Glow 1 (Maroon) - Slowest and largest movement */}
        <motion.div
          className="aurora-glow glow-1"
          variants={glowAnimation(5)} // Pass a delay value (5)
          initial="initial"
          animate="animate"
        />

        {/* Glow 2 (Blue) - Medium speed, different movement */}
        <motion.div
          className="aurora-glow glow-2"
          variants={glowAnimation(10)} // Pass a different delay (10)
          initial="initial"
          animate="animate"
        />

        {/* Glow 3 (Teal) - Fastest speed, less pronounced movement */}
        <motion.div
          className="aurora-glow glow-3"
          variants={glowAnimation(0)} // Pass a short delay (0)
          initial="initial"
          animate="animate"
        />

        {/* The Dark Overlay and Content remain the same */}
        <div className="dark-overlay"></div>
        <div className="content-overlay">{children}</div>
      </div>
    </div>
  );
};

export default Background;
