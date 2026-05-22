import { useEffect } from 'react';
import { motion } from 'framer-motion';

type HeroProps = {
  showContent: boolean;
  onAnimationComplete: () => void;
};

const INTRO_DELAY_MS = 1000;
const INTRO_DURATION_MS = 1200;

function Hero({ showContent, onAnimationComplete }: HeroProps) {
  useEffect(() => {
    if (showContent) return;
    const timer = setTimeout(onAnimationComplete, INTRO_DELAY_MS + INTRO_DURATION_MS + 50);
    return () => clearTimeout(timer);
  }, [showContent, onAnimationComplete]);

  if (!showContent) {
    return (
      <section className="hero">
        <motion.div
          className="wordmark title-gradient"
          style={{
            fontFamily: "'Skyer Monolite', sans-serif",
            position: 'fixed',
            top: '50%',
            left: '50%',
            translateX: '-50%',
            translateY: '-50%',
            willChange: 'transform',
          }}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ duration: INTRO_DURATION_MS / 1000, ease: 'easeInOut', delay: INTRO_DELAY_MS / 1000 }}
        >
          Max Kachimov
        </motion.div>
      </section>
    );
  }

  return (
    <section className="hero">
      <motion.p
        className="kicker"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
      >
        Software engineer, building <em>quietly reliable</em> systems in fintech &amp; medtech.
      </motion.p>

      <div
        className="wordmark title-gradient"
        style={{ fontFamily: "'Skyer Monolite', sans-serif" }}
      >
        Max Kachimov
      </div>

      <motion.p
        className="tagline"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
      >
        Software Engineer · Remote · EU/US · <em>Available Q3</em>
      </motion.p>
    </section>
  );
}

export default Hero;
