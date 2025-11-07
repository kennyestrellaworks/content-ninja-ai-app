## Content Ninja

> A small React + Vite app that turns a short prompt into content — an article, an image, or an instant video.

This project is a minimal content-generation front-end that demonstrates three generation flows:

- Built with React + Vite
- Uses Tailwind CSS (configured in the project)
- Integrates with:
  - **Google Gemini** (article generation) via `@google/genai` (see `src/api/geminiApi.js`)
  - **Hugging Face Spaces** via `@gradio/client` for:
    - **Image Generation**: `NihalGazi/FLUX-Unlimited` - High-quality image generation
    - **Video Generation**: `hysts/zeroscope-v2` - Text-to-video generation

The app is intended as a developer demo / prototype. Enter a prompt in the UI and choose the target content type; the app will call the configured API and return generated content.

## What you can do

- **Generate Articles**: Enter a short prompt (for example: "A friendly blog post about remote work") and generate an article using Google Gemini.
- **Generate Images**: Enter a visual prompt (for example: "A neon cyberpunk city skyline at dusk") and generate high-quality images using FLUX-Unlimited.
- **Generate Videos**: Enter a prompt and generate instant videos using Zeroscope v2 text-to-video model.

## Environment variables

Create a `.env.local` (or set environment variables) in the project root. Do NOT commit secrets.

- `VITE_GEMINI_API_KEY` - API key for Google Gemini / GenAI client (used for article generation)
- `VITE_HUGGINGFACE_API_KEY` - API key for Hugging Face (used for authentication with Gradio Spaces)

Note: The project currently reads env vars via Vite's `import.meta.env`. Make sure the variables are prefixed with `VITE_` so they are available in the browser bundle.

## Install & run (local development)

1. Install dependencies:

```powershell
npm install
```
