import React from 'react';
import { motion } from 'framer-motion';
import './Background.css';

const glowAnimation = (delay) => ({
  initial: { x: '0%', y: '0%', scale: 1, rotate: '0deg' },
  animate: {
    x: ['0%', '20%', '-10%', '0%'],
    y: ['0%', '-30%', '10%', '0%'],
    scale: [1, 1.1, 0.95, 1],
    rotate: ['0deg', '5deg', '-5deg', '0deg'],
    transition: {
      duration: 10,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
      delay: delay, // Simplified delay usage
    },
  },
});

const Background = () => {
  return (
    <div className="aurora-container">
      {/* Glow 1 (Maroon) */}
      <motion.div
        className="aurora-glow glow-1"
        variants={glowAnimation(5)}
        initial="initial"
        animate="animate"
      />

      {/* Glow 2 (Blue) */}
      <motion.div
        className="aurora-glow glow-2"
        variants={glowAnimation(10)}
        initial="initial"
        animate="animate"
      />

      {/* Glow 3 (Teal) */}
      <motion.div
        className="aurora-glow glow-3"
        variants={glowAnimation(0)}
        initial="initial"
        animate="animate"
      />

      {/* The Dark Overlay */}
      <div className="dark-overlay"></div>
    </div>
  );
};

export default Background;
