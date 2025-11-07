import { useState } from "react";
import { generateFluxImage } from "../api/gradioApi";
import { PageHeading } from "../components/PageHeading";
import {
  FiStar as Sparkles,
  FiLoader as Loader2,
  FiSearch as Search,
  FiDownload as Download,
} from "react-icons/fi";

export const ImageCreate = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      console.log("Attempting to generate image with FLUX...");
      const imageUrl = await generateFluxImage(prompt);

      if (imageUrl) {
        console.log("Image URL received:", imageUrl);
        setGeneratedImage(imageUrl);
      } else {
        setError("Image was generated but no URL was returned.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const useExamplePrompt = () => {
    setPrompt("A beautiful sunset over mountains with a crystal clear lake");
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      // Handle different image formats
      if (generatedImage.startsWith("data:")) {
        // Base64 image
        const a = document.createElement("a");
        a.href = generatedImage;
        a.download = `flux-generated-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // URL image
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `flux-generated-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(
        "Failed to download image. You can right-click and save the image instead."
      );
    }
  };

  return (
    <div className="min-h-screen sm:p-8 font-sans">
      <PageHeading
        h1={"AI Image Creator"}
        p={"Generate images instantly using NihalGazi/FLUX-Unlimited"}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center pb-4">
          <button
            onClick={useExamplePrompt}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 bg-slate-300 cursor-pointer py-1 px-4"
          >
            Use Example Prompt
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-200"
        >
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Describe your Image
          </label>

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A beautiful moonlight over the sea with stars reflecting on the water"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              Generate
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 border border-red-400 text-red-700">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-xl min-h-[300px] border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              Generated Image
            </span>
          </h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="mt-4 text-lg font-medium">Creating your image...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take 30-60 seconds
              </p>
            </div>
          )}

          {generatedImage ? (
            <div className="space-y-4">
              <img
                src={generatedImage}
                alt={`Generated: ${prompt}`}
                className="w-full h-auto object-contain rounded-lg max-h-[500px] border border-gray-200"
                onError={() => setError("Failed to load generated image")}
              />

              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    alert("Prompt copied to clipboard!");
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Copy Prompt
                </button>
              </div>
            </div>
          ) : null}

          {!isLoading && !generatedImage && !error && (
            <div className="text-center p-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <p>Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
