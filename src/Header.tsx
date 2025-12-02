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
    const timer = setTimeout(
      () => {
        setIsIntoAnimation(false);
        sessionStorage.setItem('introWasAlreadyShown', String(1));
      },
      !Number(sessionStorage.getItem('introWasAlreadyShown')) ? 2000 : 200
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="header" style={{ position: 'fixed', top: '2%' }}>
      {/* Empty space reserved for final position */}
      <motion.div
        ref={textRef}
        className="animated-top title-gradient"
        initial={{
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          position: 'fixed',
          scale: 2,
        }}
        animate={
          !isIntoAnimation
            ? {
                top: '2%',
                left: '2%',
                x: 0,
                y: 0,
                scale: 0.8,
                position: 'fixed',
                display: 'flex',
                flexDirection: 'row',
              }
            : {}
        }
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        onAnimationComplete={completeAnimation}
      >
        <span style={{ fontSize: '2rem' }}>Max Kachimov</span>
        <motion.a
          style={{
            width: '1.8rem',
            height: '1.8rem',
            marginLeft: '1rem',
            marginTop: 'auto',
            marginBottom: 'auto',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            backgroundImage: animationDone ? `url(${LINKEDIN_LOGO})` : 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={animationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          href={LINKEDIN_URL}
          target="_blank"
        ></motion.a>
      </motion.div>
    </header>
  );
}

export default App;
