/**
 * Client-side high-performance image optimizer for ExtractX.
 * Automatically downscales ultra-high-resolution images (phone camera photos,
 * high-DPI scans) before base64 encoding to drastically reduce memory usage
 * and stay well under Vercel's 4.5MB serverless payload limit, while preserving
 * crystal-clear text resolution for OCR / Gemini.
 */

export interface OptimizedFileResult {
  name: string;
  type: string;
  base64: string;
  originalSize: number;
  optimizedSize: number;
  wasOptimized: boolean;
}

const MAX_IMAGE_DIMENSION = 1800; // Optimal resolution for Gemini Multimodal OCR
const JPEG_QUALITY = 0.88;

/**
 * Resizes an image file if its dimensions or size are large, returning optimized base64
 */
export async function optimizeImageFile(file: File): Promise<OptimizedFileResult> {
  const originalSize = file.size;

  // If it's a PDF or SVG, do not run canvas compression
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
  const isSvg = file.type.includes('svg') || file.name.endsWith('.svg');

  if (!isImage || isSvg) {
    const rawBase64 = await readFileAsBase64(file);
    return {
      name: file.name,
      type: file.type || 'application/pdf',
      base64: rawBase64,
      originalSize,
      optimizedSize: originalSize,
      wasOptimized: false,
    };
  }

  // If it's a small image (< 400KB), no need to compress heavily
  if (file.size < 400 * 1024) {
    const rawBase64 = await readFileAsBase64(file);
    return {
      name: file.name,
      type: file.type || 'image/jpeg',
      base64: rawBase64,
      originalSize,
      optimizedSize: originalSize,
      wasOptimized: false,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      let shouldScale = false;

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        shouldScale = true;
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to raw base64 if canvas context unavailable
        readFileAsBase64(file).then((b64) => {
          resolve({
            name: file.name,
            type: file.type,
            base64: b64,
            originalSize,
            optimizedSize: originalSize,
            wasOptimized: false,
          });
        });
        return;
      }

      // Draw white background for transparency (e.g. PNG with transparent background)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Render image with high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG format for maximum compression efficiency and OCR clarity
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      const estimatedSize = Math.round((dataUrl.length * 3) / 4);

      resolve({
        name: file.name.replace(/\.[^.]+$/, '.jpg'),
        type: 'image/jpeg',
        base64: dataUrl,
        originalSize,
        optimizedSize: estimatedSize,
        wasOptimized: true,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readFileAsBase64(file).then((b64) => {
        resolve({
          name: file.name,
          type: file.type,
          base64: b64,
          originalSize,
          optimizedSize: originalSize,
          wasOptimized: false,
        });
      });
    };

    img.src = objectUrl;
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
