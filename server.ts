import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  extractWithGemini,
  extractWithLocalEngine,
  ExtractRequestPayload,
} from './src/server/extractionCore';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      engines: ['Gemini Multimodal (gemini-3.8-flash)', 'Local PDF Parser', 'Tesseract OCR'],
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  // Extraction endpoint
  app.post('/api/extract', async (req: Request, res: Response) => {
    try {
      const { files, config }: ExtractRequestPayload = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided for extraction.' });
      }

      // Check for custom API key in headers or config
      const customHeaderKey = req.headers['x-gemini-key'] as string | undefined;
      const effectiveConfig = {
        ...config,
        customApiKey: config?.customApiKey || customHeaderKey,
      };

      const hasApiKey = Boolean(effectiveConfig.customApiKey || process.env.GEMINI_API_KEY);

      // Try Gemini first if API key is present
      if (hasApiKey) {
        try {
          const geminiData = await extractWithGemini(files, effectiveConfig);
          return res.json({ success: true, data: geminiData });
        } catch (geminiError: any) {
          const reason =
            geminiError.message?.includes('503') || geminiError.message?.includes('high demand')
              ? 'temporary API high demand'
              : geminiError.message || 'service response';
          console.log(`[EXTRACT] AI extraction deferred (${reason}), running local OCR/PDF engine.`);
        }
      }

      // Fallback: Local OCR & PDF Text Parser
      const localData = await extractWithLocalEngine(files, effectiveConfig);
      return res.json({ success: true, data: localData });
    } catch (error: any) {
      console.error('[EXTRACT] Document extraction failed:', error.message || error);
      return res.status(500).json({
        error: error.message || 'Failed to extract text from the document.',
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExtractX Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
