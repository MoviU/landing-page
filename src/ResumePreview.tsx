import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type ResumePreviewProps = {
  pdfUrl: string;
};

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 1. Performance Detection: Identify slow hardware
  useEffect(() => {
    const checkPerformance = () => {
      // @ts-ignore - navigator.deviceMemory is experimental (RAM in GB)
      const ram = navigator.deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;

      // If device has < 4GB RAM or < 4 CPU cores, flag as low performance
      if (ram < 4 || cores < 4) {
        setIsLowPerformance(true);
      }
    };
    checkPerformance();
  }, []);

  // 2. Adaptive Scaling: Calculate resolution based on hardware and screen
  const getRenderingScale = () => {
    if (isLowPerformance) return 1.0; // Minimal RAM usage
    if (isMobile) return 1.3; // Balanced for small screens
    return 1.8; // High quality for desktop, capped to prevent lag
  };

  // 3. Dynamic Width: Ensuring 100% container fit
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const documentOptions = useMemo(
    () => ({
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl:
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    }),
    []
  );

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
        p: { xs: 2, md: 4 },
      }}
    >
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        variant="h3"
        sx={{ mb: 4, fontSize: { xs: '2rem', md: '3rem' }, ...gradientText }}
      >
        My Resume
      </Typography>

      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          width: '100%',
          maxWidth: 800,
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 2, sm: 4 },
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 50, color: '#B71C1C', mb: 1 }} />

          {error ||
            (isLowPerformance && (
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {'You can donwload my resume here'}
              </Typography>
            ))}

          {/* PDF Viewport */}
          {!(error || isLowPerformance) && (
            <Box
              ref={containerRef}
              sx={{
                width: '100%',
                minHeight: isLowPerformance ? 'auto' : { xs: 400, md: 600 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                bgcolor: '#f0f0f0',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                position: 'relative',
                // CENTER & SCALE FIX:
                '& .react-pdf__Document': {
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                },
                '& .react-pdf__Page__canvas': {
                  width: '100% !important',
                  height: 'auto !important',
                  display: 'block',
                },
              }}
            >
              <AnimatePresence>
                {loading && (
                  <Box
                    component={motion.div}
                    exit={{ opacity: 0 }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f8f8f8',
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary">
                      Loading PDF...
                    </Typography>
                  </Box>
                )}
              </AnimatePresence>

              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={() => setError(true)}
                options={documentOptions}
                loading={null}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  scale={getRenderingScale()}
                  renderTextLayer={false} // CRITICAL: Reduces memory/DOM complexity
                  renderAnnotationLayer={false} // CRITICAL: Reduces memory usage
                  loading={null}
                />
              </Document>
            </Box>
          )}

          {/* Navigation Controls */}
          {!loading &&
            !error &&
            !isLowPerformance &&
            numPages &&
            numPages > 1 && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}
              >
                <IconButton
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((prev) => prev - 1)}
                  size="small"
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <Typography variant="body2">
                  Page {pageNumber} of {numPages}
                </Typography>
                <IconButton
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((prev) => prev + 1)}
                  size="small"
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            )}

          {/* Action Button */}
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
            Download
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
