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
      scale: 1.4,
      position: 'fixed',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: 'fit-content',
      minWidth: 'fit-content',
    },
    final: {
      top: '2%',
      left: '2%',
      x: 0,
      y: 0,
      scale: 1,
      position: 'fixed',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: 'fit-content',
      minWidth: 'fit-content',
      transition: {
        duration: 1.2,
        ease: 'easeInOut',
        delay: 1.0,
      },
    },
  };

  return (
    <div className="header" style={{ position: 'fixed', top: '2%', left: '2%', width: 'auto' }}>
      <motion.div
        ref={textRef}
        className="animated-top title-gradient"
        variants={variants}
        initial="initial"
        animate={{
          ...variants.final,
          x: animationDone ? '-0.1rem' : 0,
        }}
        onAnimationComplete={completeAnimation}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content',
          minWidth: 'fit-content',
          willChange: 'transform',
        }}
        transition={{
          ...variants.final.transition,
          x: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: animationDone ? 0.5 : 0,
          },
        }}
      >
        <div
          style={{
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            fontFamily: "'Skyer Monolite', sans-serif",
            fontWeight: 'bold',
            width: 'fit-content',
            minWidth: 'fit-content',
          }}
        >
          Max Kachimov
        </div>
        <motion.a
          style={{
            width: animationDone ? '1.8rem' : '0',
            height: '1.8rem',
            marginLeft: animationDone ? '1rem' : '0',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            cursor: 'pointer',
            backgroundImage: `url(${LINKEDIN_LOGO})`,
            flexShrink: 0,
            display: 'block',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, scale: 0.8, width: 0 }}
          animate={animationDone ? { opacity: 1, scale: 1, width: '1.8rem' } : { opacity: 0, scale: 0.8, width: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.5 }}
          href={LINKEDIN_URL}
          target="_blank"
          aria-label="LinkedIn Profile"
        />
      </motion.div>
    </div>
  );
}

export default App;
