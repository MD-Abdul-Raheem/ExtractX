# ExtractX - Multi-Document to Excel Extraction Engine

ExtractX is an intelligent, high-capacity document processing web application that converts scanned documents, PDFs, and images into structured, multi-sheet Excel (.xlsx) workbooks with interactive human-in-the-loop review.

## Key Features

- **High-Capacity Batch Ingestion**: Upload up to 30 documents (PDFs, PNG, JPG, JPEG, WEBP) in a single conversion session.
- **Client-Side Image Optimization**: High-resolution smartphone photos and large document scans are automatically downscaled and compressed in-browser to prevent payload bloat and stay well within Vercel's 4.5MB serverless limit.
- **Batched Multimodal AI Pipeline**: Processes multi-document uploads through resilient micro-batches, preventing serverless timeouts and merging matching sheets across documents.
- **Dynamic Excel Generation**: Produces genuine `.xlsx` files with customizable sheet names, column widths, and proper numeric formatting.
- **Full Review Grid**: In-browser spreadsheet viewer allowing cell edits, column additions, sheet renaming, and search filtering before export.

---

## Deploying to Vercel

ExtractX is pre-configured for seamless deployment to **Vercel**:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy ExtractX"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select your GitHub repository.
   - Framework Preset: **Vite** (detected automatically).
   - Build Command: `npm run build` (or default).
   - Output Directory: `dist` (configured in `vercel.json`).

3. **Configure Environment Variables in Vercel**:
   - Under **Project Settings > Environment Variables**, add:
     - `GEMINI_API_KEY`: Your Google Gemini API Key.
     *(Note: If you haven't set the key in Vercel yet, you can also enter it temporarily directly in the ExtractX UI)*.

4. **Deploy**:
   - Click **Deploy**. Vercel will build the static frontend in `dist` and deploy the `/api/extract` and `/api/health` serverless functions automatically.

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
