import { useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import Background from './Background';
import Hero from './Hero';
import Topbar from './Topbar';
import Contact from './Contact';
import Footer from './Footer';

function App() {
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <Background />
      <main className="page">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Topbar />
          </motion.div>
        )}

        <Hero
          showContent={showContent}
          onAnimationComplete={() => setShowContent(true)}
        />

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <Contact />
          </motion.div>
        )}

        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
          >
            <Footer />
          </motion.div>
        )}
      </main>
    </>
  );
}

export default App;
