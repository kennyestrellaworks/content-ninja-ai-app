import { client } from "@gradio/client";

export const generateInstantVideo = async (prompt) => {
  try {
    console.log("Connecting to Instant-Video space for instant video...");

    // Some versions might still use the client function directly
    const app = await client("SahaniJi/Instant-Video");

    console.log("Calling /instant_video with prompt:", prompt);

    const result = await app.predict("/instant_video", [
      prompt, // string  in 'Prompt' Textbox component
      "Cartoon", // string  in 'Base model' Dropdown component
      "", // string  in 'Motion' Dropdown component - leave empty
      "1", // string  in 'Inference steps' Dropdown component
    ]);

    console.log("Instant video response:", result);

    // Extract the video URL from the response structure
    if (result.data && result.data[0]) {
      const responseData = result.data[0];
      console.log("Full response data:", responseData);

      // The video URL is at responseData.video.url
      if (responseData.video && responseData.video.url) {
        const videoUrl = responseData.video.url;
        console.log("Video URL found:", videoUrl);
        return videoUrl;
      } else {
        console.log("Video URL not found in response structure");
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Instant Video API Error:", error);
    throw new Error(`Failed to generate instant video: ${error.message}`);
  }
};
