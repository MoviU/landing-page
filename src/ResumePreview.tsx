import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';

type ResumePreviewProps = {
  pdfUrl: string; // URL or public path to your PDF
};

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  const gradientText = {
    background:
      'linear-gradient(90deg,rgba(112, 39, 39, 1) 0%, rgba(4, 71, 125, 1) 47%, rgba(23, 163, 112, 1) 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      {/* Header */}
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        variant="h3"
        sx={{ mb: 6, ...gradientText }}
      >
        My Resume
      </Typography>

      {/* PDF Preview Card */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        sx={{
          width: '100%',
          maxWidth: 800,
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 60, color: '#B71C1C', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Preview My PDF Resume
          </Typography>

          {/* PDF iframe preview */}
          <Box
            component="iframe"
            src={pdfUrl}
            sx={{
              width: '100%',
              height: 500,
              border: '1px solid #ccc',
              borderRadius: 2,
            }}
          />

          {/* Download Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              background:
                'linear-gradient(90deg, #702727 0%, #04717D 47%, #17A370 100%)',
            }}
            href={pdfUrl}
            download
            startIcon={<DownloadIcon />}
          >
            Download Resume
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
