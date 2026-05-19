import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  // CircularProgress,
  useTheme,
  useMediaQuery,
  // IconButton,
} from '@mui/material';

import { motion /* , AnimatePresence */ } from 'framer-motion';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import DownloadIcon from '@mui/icons-material/Download';
// import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// import { useState, useRef, useEffect, useMemo } from 'react';

// 1. STANDARD NAMED IMPORTS: We switch back to standard imports to control initialization
// Note: This will put the react-pdf library into the main chunk, but it guarantees stability.
// The performance gain of hiding the component on low-end devices remains.
// import { Document, Page, pdfjs } from 'react-pdf';

type ResumePreviewProps = {
  pdfUrl: string;
};

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  /* PDF preview disabled
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // NEW STATE: Tracks if pdf.js worker is ready to render
  const [pdfReady, setPdfReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  */

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /* PDF preview disabled
  // ==========================================================
  // HANDLER FIX: Await Worker Initialization
  // ==========================================================
  useEffect(() => {
    // 1. Performance Detection (Unchanged)
    const checkPerformance = () => {
      // @ts-ignore
      const ram = navigator.deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;

      if (ram < 4 || cores < 4) {
        setIsLowPerformance(true);
      }
    };
    checkPerformance();

    // 2. Worker Initialization (CRITICAL FIX)
    try {
      // Set up the worker source *once*
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      setPdfReady(true); // Signal that the environment is ready
    } catch (e) {
      // Fallback for extreme cases (e.g., environment without window/pdfjs)
      console.error('Failed to initialize pdf.js worker:', e);
      setError(true);
    }
  }, []); // Runs once on mount

  // 3. Dynamic Width (Unchanged)
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

  // Adaptive Scaling (Unchanged)
  const getRenderingScale = () => {
    if (isLowPerformance) return 1.0;
    if (isMobile) return 1.3;
    return 1.8;
  };

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

  const hidePreview = error || isLowPerformance || !pdfReady; // Now hides if worker isn't ready
  */

  const gradientText = {
    background:
      'linear-gradient(90deg,rgba(112, 39, 39, 1) 0%, rgba(4, 71, 125, 1) 47%, rgba(23, 163, 112, 1) 100%)',
    WebkitBackgroundClip: 'text',
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
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          width: '100%',
          maxWidth: 650,
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
            <Typography
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        variant="h3"
        sx={{ mb: 4, fontSize: { xs: '2rem', md: '3rem' }, ...gradientText }}
      >
        Check out My Resume
      </Typography>
          {/* <PictureAsPdfIcon sx={{ fontSize: 50, color: '#B71C1C', mb: 1 }} /> */}

          {/* <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            See my Resume
          </Typography> */}

          {/* PDF preview disabled
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {hidePreview ? 'Download Resume' : 'Preview My Resume'}
          </Typography>

          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              minHeight: hidePreview ? 'auto' : { xs: 400, md: 600 },
              display: hidePreview ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              bgcolor: '#f0f0f0',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              position: 'relative',
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
                    {pdfReady ? 'Loading PDF...' : 'Initializing Renderer...'}
                  </Typography>
                </Box>
              )}
            </AnimatePresence>

            {pdfReady && (
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
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={null}
                />
              </Document>
            )}
          </Box>

          {!hidePreview && !loading && numPages && numPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
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
          */}

          <Button
            variant="contained"
            color="primary"
            size={isMobile ? 'medium' : 'large'}
            component="a"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              background: 'linear-gradient(90deg, #702727 0%, #04717D 100%)',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Click here
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
