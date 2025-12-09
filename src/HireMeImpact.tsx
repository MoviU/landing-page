import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const MotionCard = motion(Card);

export default function HireMeImpact() {
  const gradientText = {
    background:
      'linear-gradient(90deg,rgba(112, 39, 39, 1) 0%, rgba(4, 71, 125, 1) 47%, rgba(23, 163, 112, 1) 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    fontWeight: 900,
  };

  const metrics = [
    { label: 'Stock Price', value: 342, suffix: '%', icon: TrendingUpIcon },
    { label: 'Performance', value: 4, suffix: 'x', icon: RocketLaunchIcon },
    {
      label: 'Features released',
      value: 178,
      suffix: ' ↑',
      icon: EmojiEventsIcon,
    },
    {
      label: 'Dev Happiness',
      value: Infinity,
      suffix: '',
      icon: ThumbUpAltIcon,
    },
  ];

  const [counts, setCounts] = useState(metrics.map(() => 0));
  const [clicked, setClicked] = useState(metrics.map(() => false));

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setCounts(
        metrics.map((m) =>
          m.value === Infinity ? Infinity : Math.floor(m.value * progress)
        )
      );

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const clickAnimations = [
    { rotate: 360 },
    { rotate: -360 },
    { scale: [1, 1.2, 1], transition: { duration: 0.4 } },
    { rotateY: 360, transition: { duration: 0.6 } },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
        background: 'transparent',
      }}
    >
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        variant="h3"
        sx={{ 
          mb: { xs: 4, sm: 5, md: 6 },
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
          ...gradientText 
        }}
      >
        What Happens When You Hire Me
      </Typography>

      {/* ↓↓↓ SIMPLE "COL-6 / COL-3" GRID ↓↓↓ */}
      <Box
        sx={{
          width: { xs: '95%', sm: '80%' },
          maxWidth: 1100,
          display: 'grid',
          gap: { xs: 1.5, sm: 2, md: 3 },
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // col-6 (2 columns on mobile)
            sm: 'repeat(2, 1fr)', // col-6
            md: 'repeat(2, 1fr)', // col-6
            lg: 'repeat(2, 1fr)', // col-6 (keep 2 columns at 1200px)
            xl: 'repeat(4, 1fr)', // col-3 (4 columns only at 1536px+)
          },
        }}
      >
        {metrics.map((m, i) => {
          const Icon = m.icon;

          return (
            <motion.div
              key={m.label}
              animate={clicked[i] ? clickAnimations[i] : {}}
              onClick={() => {
                const nxt = [...clicked];
                nxt[i] = !nxt[i];
                setClicked(nxt);
              }}
              style={{ width: '100%' }}
            >
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{
                  default: { duration: 0.45, delay: i * 0.08 },
                }}
                sx={{
                  borderRadius: { xs: 1.5, sm: 2, md: 3 },
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: { xs: '0 4px 15px rgba(0,0,0,0.1)', sm: '0 8px 25px rgba(0,0,0,0.15)' },
                  p: { xs: 1, sm: 2, md: 3 },
                  textAlign: 'center',
                }}
              >
                <CardContent sx={{ p: { xs: '8px !important', sm: '10px !important', md: '10px !important' } }}>
                  <Box sx={{ mb: { xs: 0.25, sm: 0.5, md: 1 }, color: '#07477D' }}>
                    <Icon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }} />
                  </Box>

                  <Typography 
                    variant="h6" 
                    sx={{ 
                      ...gradientText,
                      fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1.25rem' },
                      mb: { xs: 0.25, sm: 0.5, md: 1 },
                      lineHeight: { xs: 1.2, sm: 1.4 },
                    }}
                  >
                    {m.label}
                  </Typography>

                  <Typography 
                    variant="h4" 
                    sx={{ 
                      ...gradientText,
                      fontSize: { xs: '1rem', sm: '1.5rem', md: '2.5rem' },
                      lineHeight: { xs: 1.2, sm: 1.3 },
                    }}
                  >
                    {counts[i] === Infinity ? '∞' : counts[i] + m.suffix}
                  </Typography>
                </CardContent>
              </MotionCard>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
