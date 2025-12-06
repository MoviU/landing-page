import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LINKEDIN_LOGO } from './constants/iconPaths';

function App(props: { onAnimationComplete: () => void }) {
  const [isIntoAnimation, setIsIntoAnimation] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);
  const textRef = useRef(null);
  const LINKEDIN_URL: undefined | string = import.meta.env.VITE_LINKEDIN_URL;

  const completeAnimation = (): void => {
    setAnimationDone(true);

    props.onAnimationComplete();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntoAnimation(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const variants = {
    initial: {
      top: '50%',
      left: '50%',
      x: '-50%',
      y: '-50%',
      scale: 2,
      position: 'fixed',
    },
    final: {
      top: '2%',
      left: '2%',
      x: 0,
      y: 0,
      scale: 0.8,
      position: 'fixed',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      transition: {
        duration: 1.2,
        ease: 'easeInOut',
        delay: 1.0, // ← Use Framer’s built-in delay (optional)
      },
    },
  };

  return (
    <div className="header" style={{ position: 'fixed', top: '2%' }}>
      {/* Empty space reserved for final position */}
      <motion.div
        ref={textRef}
        className="animated-top title-gradient"
        variants={variants}
        initial="initial"
        animate="final"
        onAnimationComplete={completeAnimation}
      >
        <div
          style={{
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Max Kachimov
        </div>
        <motion.a
          style={{
            width: '1.8rem',
            height: '1.8rem',
            marginLeft: '1rem',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            backgroundImage: animationDone ? `url(${LINKEDIN_LOGO})` : 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={animationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          href={LINKEDIN_URL}
          target="_blank"
        ></motion.a>
      </motion.div>
    </div>
  );
}

export default App;
