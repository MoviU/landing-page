import './App.css';
import Intro from './Header';
import HireMeImpact from './HireMeImpact';
import ResumePreview from './ResumePreview';
import { useState, useRef, useEffect, Component } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Background from './Background';

function App() {
  const [showContent, setShowContent] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const pdfUrl = import.meta.env.VITE_PDF_URL;

  const metricsRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  const scrollToNext = () => {
    if (
      metricsRef.current &&
      window.scrollY < metricsRef.current.offsetTop - 50
    ) {
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

      // Hide bottom arrow if we are within 100px of the document bottom
      setShowArrow(scrollY + viewportHeight < fullHeight - 100);
    };

    // Use a passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page" style={{ position: 'relative' }}>
      <Background />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          style={{
            opacity: headerOpacity,
            marginBottom: '80px',
          }}
        >
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
    </div>
  );
}

export default App;
