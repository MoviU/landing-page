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
        p: 4,
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
        sx={{ mb: 6, ...gradientText }}
      >
        What Happens When You Hire Me
      </Typography>

      {/* ↓↓↓ SIMPLE "COL-6 / COL-3" GRID ↓↓↓ */}
      <Box
        sx={{
          width: '80%',
          maxWidth: 1100,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)', // col-12
            sm: 'repeat(1, 1fr)', // col-6
            lg: 'repeat(4, 1fr)', // col-3
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
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 1, color: '#07477D' }}>
                    <Icon fontSize="large" />
                  </Box>

                  <Typography variant="h6" sx={gradientText}>
                    {m.label}
                  </Typography>

                  <Typography variant="h4" sx={{ ...gradientText }}>
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
