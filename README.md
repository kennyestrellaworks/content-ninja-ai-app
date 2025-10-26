## Content Ninja

> A small React + Vite app that turns a short prompt into content — an article, an image, or an instant video.

This project is a minimal content-generation front-end that demonstrates three generation flows:

- Built with React + Vite
- Uses Tailwind CSS (configured in the project)
- Integrates with:
  - Google Gemini (image generation) via `@google/genai` (see `src/api/geminiApi.js`)
  - Hugging Face (used for image and video generation via the project's configured keys)
  - Gradio Spaces client (`@gradio/client`) to call an Instant-Video space (see `src/api/gradioApi.js`)

The app is intended as a developer demo / prototype. Enter a prompt in the UI and choose the target content type; the app will call the configured API and return generated content.

## What you can do

- Enter a short prompt (for example: "A friendly blog post about remote work") and generate an article.
- Enter a visual prompt (for example: "A neon cyberpunk city skyline at dusk") and generate an image.
- Enter a prompt and request an instant video (the app forwards the prompt to a Gradio Space and returns the video URL).

## Environment variables

Create a `.env.local` (or set environment variables) in the project root. Do NOT commit secrets.

- `VITE_GEMINI_API_KEY` - API key for Google Gemini / GenAI client (used in `src/api/geminiApi.js`).
- `VITE_GEMINI_API_KEY_IMAGE` - optional additional key/name used by the project (present in the repo `.env.local` example).
- `VITE_HUGGINGFACE_API_KEY` - present in the repo's `.env.local` but not required for the two APIs in `src/api/`.

Note: The project currently reads env vars via Vite's `import.meta.env`. Make sure the variables are prefixed with `VITE_` so they are available in the browser bundle.

## Install & run (local development)

1. Install dependencies:

```powershell
npm install
```

2. Add environment variables to `.env.local` (see the previous section)

3. Start the dev server:

```powershell
npm run dev
```

4. Open your browser at `http://localhost:5173` (Vite default) and try the app.

## Troubleshooting

- If the image/video generation fails, check console logs in the browser and the terminal for API errors. Common issues:
  - Missing or invalid API key
  - Quota / RESOURCE_EXHAUSTED (Gemini) — the Gemini helper implements limited retries
  - Gradio spaces may change their API or response structure; inspect `src/api/gradioApi.js` logs

## Project structure (short)

- `src/` — React source

  - `src/api/` — API wrappers (Gemini & Gradio)
  - `src/components/` — UI components (sidebar, page headings, etc.)
  - `src/pages/` — app pages (ArticleCreate, ImageCreate, VideoCreate)
  - `index.css` — project styles (Tailwind)
