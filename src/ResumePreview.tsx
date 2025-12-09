import { Box, Card, CardContent, Typography, Button, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker to use local file from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type ResumePreviewProps = {
  pdfUrl: string; // URL or public path to your PDF
};

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate high-quality scale based on device pixel ratio
  // This ensures crisp rendering on retina/high-DPI displays
  const getHighQualityScale = () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    // Use 2-3x scale for high-quality rendering
    // Higher scale = better quality but more memory usage
    return Math.max(devicePixelRatio * 2, 2.5);
  };

  // Calculate page width based on container
  useEffect(() => {
    const updatePageWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Subtract padding (16px on each side = 32px total) and border
        const availableWidth = containerWidth - 32 - 4; // padding + border
        setPageWidth(Math.max(300, availableWidth)); // Minimum 300px
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  const gradientText = {
    background:
      'linear-gradient(90deg,rgba(112, 39, 39, 1) 0%, rgba(4, 71, 125, 1) 47%, rgba(23, 163, 112, 1) 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    fontWeight: 900,
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError('Failed to load PDF. Please try again later.');
    setLoading(false);
    console.error('Error loading PDF:', error);
  }

  // Memoize document options to prevent unnecessary reloads
  const documentOptions = useMemo(
    () => ({
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    }),
    []
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        variant="h3"
        sx={{ 
          mb: { xs: 3, sm: 4, md: 6 }, 
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          ...gradientText 
        }}
      >
        My Resume
      </Typography>

      {/* PDF Preview Card */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        whileHover={{ scale: isMobile ? 1 : 1.02 }}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 2, sm: 3 },
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: '#B71C1C', mb: { xs: 1, sm: 2 } }} />
          <Typography 
            variant="h5" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              textAlign: 'center',
            }}
          >
            Preview My PDF Resume
          </Typography>

          {/* PDF Canvas Preview */}
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid #ccc',
              borderRadius: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 2 },
              minHeight: { xs: 400, sm: 500 },
              maxHeight: { xs: '70vh', sm: '80vh', md: 'none' },
              overflow: 'auto',
              justifyContent: 'center',
              bgcolor: '#f5f5f5',
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  zIndex: 1,
                }}
              >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading PDF...
                </Typography>
              </Box>
            )}

            {error && (
              <Typography variant="body1" color="error" sx={{ textAlign: 'center', p: 2 }}>
                {error}
              </Typography>
            )}

            <Box
              sx={{
                display: loading || error ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                '& canvas': {
                  width: '100% !important',
                  height: 'auto !important',
                  maxWidth: '100%',
                  // Use auto rendering for smooth anti-aliased text
                  imageRendering: 'auto',
                  // Ensure high-quality rendering
                  imageSmoothingEnabled: true,
                  imageSmoothingQuality: 'high',
                },
              }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                options={documentOptions}
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  canvasBackground="white"
                  // Width sets display size, scale multiplies rendering resolution
                  // Higher scale = sharper text on high-DPI displays
                  width={pageWidth}
                  scale={getHighQualityScale()}
                  renderMode="canvas"
                />
              </Document>
            </Box>

            {/* Page Navigation */}
            {numPages && numPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  mt: { xs: 1.5, sm: 2 },
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Page {pageNumber} of {numPages}
                </Typography>
                <Button
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((prev) => Math.min(numPages, prev + 1))}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>

          {/* Download Button */}
          <Button
            variant="contained"
            color="primary"
            size={isMobile ? 'medium' : 'large'}
            sx={{
              mt: { xs: 2, sm: 3 },
              background:
                'linear-gradient(90deg, #702727 0%, #04717D 47%, #17A370 100%)',
              width: { xs: '100%', sm: 'auto' },
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
