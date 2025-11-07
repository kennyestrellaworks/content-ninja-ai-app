import { Client } from "@gradio/client";

export const generateZeroscopeVideo = async (prompt) => {
  try {
    console.log("Connecting to Zeroscope space for video generation...");

    const client = await Client.connect("hysts/zeroscope-v2");

    console.log("Calling /run with prompt:", prompt);

    const result = await client.predict("/run", {
      prompt: prompt,
      seed: Math.floor(Math.random() * 1000000),
      num_frames: 24,
      num_inference_steps: 10,
    });

    console.log("Zeroscope video response:", result);

    if (
      result.data &&
      result.data[0] &&
      result.data[0].video &&
      result.data[0].video.url
    ) {
      const videoUrl = result.data[0].video.url;
      console.log("Video URL found:", videoUrl);
      return videoUrl;
    } else {
      console.log("No video URL found in response:", result.data);
      throw new Error("No video URL returned from API");
    }
  } catch (error) {
    console.error("Zeroscope Video API Error:", error);
    throw new Error(`Failed to generate video: ${error.message}`);
  }
};

// Alternative with more parameters
export const generateZeroscopeVideoAdvanced = async (prompt) => {
  try {
    console.log("Connecting to Zeroscope with advanced parameters...");

    const client = await Client.connect("hysts/zeroscope-v2");

    const result = await client.predict("/run", {
      prompt: prompt,
      seed: Math.floor(Math.random() * 1000000),
      num_frames: 24,
      num_inference_steps: 10,
      guidance_scale: 7.5,
      width: 576,
      height: 320,
    });

    console.log("Advanced Zeroscope response:", result);

    if (
      result.data &&
      result.data[0] &&
      result.data[0].video &&
      result.data[0].video.url
    ) {
      return result.data[0].video.url;
    } else {
      throw new Error("No video URL returned from advanced API");
    }
  } catch (error) {
    console.error("Advanced Zeroscope Video API Error:", error);
    throw new Error(
      `Failed to generate video with advanced parameters: ${error.message}`
    );
  }
};

// Keep the original function for backward compatibility
export const generateInstantVideo = async (prompt) => {
  return generateZeroscopeVideo(prompt);
};

export const generateFluxImage = async (prompt) => {
  try {
    console.log("Connecting to FLUX-Unlimited space for image generation...");

    const client = await Client.connect("NihalGazi/FLUX-Unlimited");

    console.log("Calling /generate_image with prompt:", prompt);

    const result = await client.predict("/generate_image", [
      prompt, // string  in 'Prompt' Textbox component
      1024, // number  in 'Width' Number component
      1024, // number  in 'Height' Number component
      Math.floor(Math.random() * 1000000), // number  in 'Seed' Number component
      true, // boolean  in 'Randomize' Checkbox component
      "Google US Server", // string  in 'Server Choice' Radio component
    ]);

    console.log("FLUX image response:", result);

    if (result.data && result.data[0]) {
      const imageData = result.data[0];
      console.log("Full image response data:", imageData);

      if (imageData.url) {
        console.log("Image URL found:", imageData.url);
        return imageData.url;
      } else if (imageData.image && imageData.image.url) {
        console.log("Image URL found in image object:", imageData.image.url);
        return imageData.image.url;
      } else if (imageData.data && imageData.data.url) {
        console.log("Image URL found in data object:", imageData.data.url);
        return imageData.data.url;
      } else if (
        typeof imageData === "string" &&
        imageData.startsWith("http")
      ) {
        console.log("Direct image URL:", imageData);
        return imageData;
      } else {
        console.log(
          "Image URL not found in response structure, returning raw data:",
          imageData
        );
        return imageData;
      }
    }

    return null;
  } catch (error) {
    console.error("FLUX Image API Error:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};
