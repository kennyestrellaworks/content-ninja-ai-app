import { GoogleGenAI } from "@google/genai";

// --- Configuration ---
// 1. Get the API Key from environment variables loaded by Vite.
//    NOTE: Vite exposes env vars prefixed with VITE_
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 2. The correct model for image generation via the public Gemini API.
const IMAGE_MODEL = "gemini-2.5-flash-image";

// 3. Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Converts a string to a base64 Data URL, which can be directly used by
 * the <img> tag in the browser.
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/png').
 * @param {string} base64Data - The raw base64 string of the image.
 * @returns {string} The Data URL string.
 */
function toDataUrl(mimeType, base64Data) {
  return `data:${mimeType};base64,${base64Data}`;
}

// Simple sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates an image based on a text prompt using the Gemini API.
 * * @param {string} prompt The text description for the image to generate.
 * @returns {string | null} The base64 Data URL of the generated image, or null on failure.
 */
export async function generateArticle(prompt) {
  if (!GEMINI_API_KEY) {
    const msg =
      "Gemini API Key is not configured. Set VITE_GEMINI_API_KEY and restart the dev server.";
    console.error(msg);
    throw new Error(msg);
  }

  console.log(`Sending prompt to ${IMAGE_MODEL}: "${prompt}"`);

  // Implement limited retry logic for RESOURCE_EXHAUSTED (quota) errors
  const maxRetries = 2;
  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      // NOTE: The public Gemini API only allows certain response MIME types
      // (text/plain, application/json, application/xml, application/yaml, text/x.enum).
      // Requesting a raw image MIME (e.g. "image/png") causes INVALID_ARGUMENT errors.
      // We request `application/json` and expect the model to return base64-encoded
      // image data inside the JSON parts (as `inlineData`).
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          // Optional: you could add aspect ratio here, e.g., '1:1', '16:9'
        },
      });

      // Check if the response contains image data
      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData
      );

      if (imagePart && imagePart.inlineData) {
        const mimeType = imagePart.inlineData.mimeType || "image/png";
        const base64Data = imagePart.inlineData.data;

        console.log("Image generation successful!");

        // Convert the raw base64 data to a Data URL for browser display
        return toDataUrl(mimeType, base64Data);
      }

      // Fallback for cases where an image wasn't generated but no error was thrown
      console.warn(
        "API call succeeded but no image data was found in the response parts."
      );
      console.log("Full response:", JSON.stringify(response, null, 2));
      throw new Error(
        "No image data found in the API response. Check the console for the full response."
      );
    } catch (error) {
      // If it's a quota error, attempt to parse RetryInfo and retry
      const status = error?.error?.status || error?.status || null;
      const isQuotaError = status === "RESOURCE_EXHAUSTED" || status === 429;

      // Try to find retryDelay from the error details (google.rpc.RetryInfo)
      let retryDelayMs = null;
      try {
        const details = error?.error?.details || error?.details || [];
        const retryInfo = details.find((d) =>
          d["@type"]?.includes("RetryInfo")
        );
        // retryDelay may be a string like '22s' or an object with seconds/nanos
        if (retryInfo?.retryDelay) {
          const rd = retryInfo.retryDelay;
          if (typeof rd === "string" && rd.endsWith("s")) {
            // e.g., '22s' => 22000 ms
            retryDelayMs = parseFloat(rd.slice(0, -1)) * 1000;
          } else if (rd.seconds) {
            retryDelayMs =
              Number(rd.seconds || 0) * 1000 + Math.ceil((rd.nanos || 0) / 1e6);
          }
        }
      } catch (parseErr) {
        console.warn(
          "Failed to parse retry delay from error details:",
          parseErr
        );
      }

      // Log full error for debugging
      console.error(
        "Error during image generation (attempt",
        attempt,
        "):",
        error
      );

      if (isQuotaError && attempt <= maxRetries) {
        // Determine delay: use server-suggested or exponential backoff
        const backoffMs = retryDelayMs || Math.min(1000 * 2 ** attempt, 30000);
        console.warn(
          `Quota/RESOURCE_EXHAUSTED detected. Retrying in ${backoffMs}ms (attempt ${attempt} of ${maxRetries}).`
        );
        await sleep(backoffMs);
        continue; // retry
      }

      // No more retries or not a quota error: surface friendly message
      try {
        if (error?.response) {
          console.error(
            "Error response:",
            JSON.stringify(error.response, null, 2)
          );
        }
      } catch (logErr) {
        console.error("Failed to log nested error response:", logErr);
      }

      const msg =
        error?.message ||
        JSON.stringify(error) ||
        "Unknown error from Gemini API";
      throw new Error(`Image generation failed: ${msg}`);
    }
  }
}
