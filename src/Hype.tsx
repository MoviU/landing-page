import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

export default function HireMeImpact() {
  const metrics = [
    {
      label: 'Stock Price',
      value: '+342%',
      icon: TrendingUpIcon,
    },
    {
      label: 'Performance',
      value: 'x4',
      icon: RocketLaunchIcon,
    },
    {
      label: 'Code Quality',
      value: '200% ↑',
      icon: EmojiEventsIcon,
    },
    {
      label: 'Dev Happiness',
      value: '∞',
      icon: ThumbUpAltIcon,
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Title */}
      <Typography
        variant="h3"
        fontWeight={700}
        textAlign="center"
        sx={{ mb: 4 }}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        📈 What Happens When You Hire Me
      </Typography>

      {/* Animated “chart” */}
      <Box
        component={motion.div}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.03 }}
        sx={{
          height: 260,
          borderRadius: 4,
          mb: 5,
          background:
            'linear-gradient(135deg, #d1f4ff 0%, #92e8ff 40%, #00bcd4 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            bottom: 0,
          }}
        >
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <motion.path
              d="M0 200 Q 120 150 240 170 T 480 120 T 720 30"
              fill="none"
              stroke="#004d40"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <Typography
          variant="h5"
          sx={{ position: 'absolute', bottom: 16, left: 16, color: 'white' }}
        >
          Guaranteed Upward Movement*
        </Typography>
      </Box>

      {/* Metrics */}
      <Grid container spacing={3}>
        {metrics.map((m, i) => {
          const Icon = m.icon;

          return (
            <Grid item xs={12} sm={6} md={3} key={m.label}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ scale: 1.06 }}
                sx={{
                  borderRadius: 3,
                  textAlign: 'center',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f0faff 100%)',
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 1, color: '#00695c' }}>
                    <Icon fontSize="large" />
                  </Box>

                  <Typography variant="h6" fontWeight={600}>
                    {m.label}
                  </Typography>

                  <Typography variant="h4" color="primary" fontWeight={900}>
                    {m.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
