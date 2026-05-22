import { useEffect } from 'react';
import { motion } from 'framer-motion';

type HeroProps = {
  showContent: boolean;
  onAnimationComplete: () => void;
};

const INTRO_APPEAR_MS = 700;
const INTRO_HOLD_MS = 450;
export const GLIDE_DURATION_S = 1.0;

function Hero({ showContent, onAnimationComplete }: HeroProps) {
  useEffect(() => {
    if (showContent) return;
    const timer = setTimeout(onAnimationComplete, INTRO_APPEAR_MS + INTRO_HOLD_MS);
    return () => clearTimeout(timer);
  }, [showContent, onAnimationComplete]);

  if (!showContent) {
    return (
      <section className="hero">
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            layoutId="wordmark"
            className="wordmark title-gradient"
            style={{ fontFamily: "'Skyer Monolite', sans-serif", willChange: 'transform, opacity' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: INTRO_APPEAR_MS / 1000, ease: 'easeOut' }}
          >
            Max Kachimov
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <motion.p
        className="kicker"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: GLIDE_DURATION_S + 0.05 }}
      >
        Software engineer, building quietly reliable systems in fintech &amp; medtech.
      </motion.p>

      <motion.div
        layoutId="wordmark"
        className="wordmark title-gradient"
        style={{ fontFamily: "'Skyer Monolite', sans-serif" }}
        transition={{ layout: { duration: GLIDE_DURATION_S, ease: [0.16, 1, 0.3, 1] } }}
      >
        Max Kachimov
      </motion.div>

      <motion.p
        className="tagline"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: GLIDE_DURATION_S + 0.2 }}
      >
        Software Engineer · California, USA
      </motion.p>
    </section>
  );
}

export default Hero;
