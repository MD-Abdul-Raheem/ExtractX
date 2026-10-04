export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    platform: 'vercel-serverless',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    engines: ['Gemini Multimodal (gemini-3.8-flash)', 'Local PDF Parser', 'Tesseract OCR'],
    timestamp: new Date().toISOString(),
  });
}
