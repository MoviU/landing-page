import './App.css';
import Intro from './Header';
import HireMeImpact from './HireMeImpact';
import ResumePreview from './ResumePreview';
import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

function App() {
  const [showContent, setShowContent] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const pdfUrl = import.meta.env.VITE_PDF_URL;

  const metricsRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Controls for header animation
  const headerControls = useAnimation();

  // Scroll to the next section dynamically
  const scrollToNext = () => {
    if (metricsRef.current && window.scrollY < metricsRef.current.offsetTop) {
      metricsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (resumeRef.current) {
      resumeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.body.scrollHeight;

      // Hide bottom arrow near bottom
      setShowArrow(scrollY + viewportHeight < fullHeight - 10);

      // Fade header based on scroll
      if (scrollY > 50) {
        headerControls.start({ opacity: 0, transition: { duration: 0.5 } });
      } else {
        headerControls.start({ opacity: 1, transition: { duration: 0.5 } });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerControls]);

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Animate header opacity */}
      <motion.div animate={headerControls}>
        <Intro onAnimationComplete={() => setShowContent(true)} />
      </motion.div>

      {showContent && (
        <div ref={metricsRef}>
          <HireMeImpact />
        </div>
      )}

      {showContent && pdfUrl && (
        <div ref={resumeRef}>
          <ResumePreview pdfUrl={pdfUrl} />
        </div>
      )}

      {showContent && showArrow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 100,
            cursor: 'pointer',
            fontSize: 40,
            fontWeight: 'bold',
          }}
          onClick={scrollToNext}
        >
          <svg viewBox="0 0 24 24" width="40" height="40">
            <defs>
              <linearGradient
                id="arrowGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#702727" />
                <stop offset="50%" stopColor="#04717D" />
                <stop offset="100%" stopColor="#17A370" />
              </linearGradient>
            </defs>
            <text
              x="12"
              y="18"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="url(#arrowGradient)"
              transform="rotate(90 12 12)"
            >
              →
            </text>
          </svg>
        </motion.div>
      )}
    </div>
  );
}

export default App;
