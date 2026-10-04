import { extractWithGemini, extractWithLocalEngine, ExtractRequestPayload } from '../src/server/extractionCore';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Gemini-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const rawBody = req.body;
    const body: ExtractRequestPayload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const { files, config: extractConfig } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for extraction.' });
    }

    // Support custom key from header or config
    const customHeaderKey = req.headers['x-gemini-key'] as string | undefined;
    const effectiveConfig = {
      ...extractConfig,
      customApiKey: extractConfig?.customApiKey || customHeaderKey,
    };

    const hasApiKey = Boolean(effectiveConfig.customApiKey || process.env.GEMINI_API_KEY);

    if (hasApiKey) {
      try {
        const geminiData = await extractWithGemini(files, effectiveConfig);
        return res.status(200).json({ success: true, data: geminiData });
      } catch (geminiError: any) {
        console.warn('[VERCEL EXTRACT] Gemini deferred, falling back to local engine:', geminiError.message);
      }
    }

    // Fallback: Local engine
    const localData = await extractWithLocalEngine(files, effectiveConfig);
    return res.status(200).json({ success: true, data: localData });
  } catch (error: any) {
    console.error('[VERCEL EXTRACT] Extraction error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to extract text from document.',
    });
  }
}
