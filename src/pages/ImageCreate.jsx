import { useState } from "react";
import {
  FiStar as Sparkles,
  FiZap as Wand2,
  FiLoader as Loader2,
  FiSearch as Search,
  FiZap as Zap,
  FiCode as Code,
  FiFileText as FileText,
  FiDownload as Download,
} from "react-icons/fi";
import { PageHeading } from "../components/PageHeading";

export const ImageCreate = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const apiToken = import.meta.env.VITE_HUGGINGFACE_API_KEY;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to download image.");
    }
  };

  return (
    <div className="min-h-screen sm:p-8 font-sans">
      <PageHeading
        h1={"AI Image Creator"}
        p={"Generate your image instantly."}
      />

      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={generateImage}
          className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-200"
        >
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Describe your Image
          </label>
          <div className="flex space-x-3">
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene mountain landscape at sunset with a crystal clear lake reflecting the golden sky..."
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
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

        {/* Loading and Error Display */}
        {error && (
          <div
            className={`p-4 mb-6 rounded-lg bg-red-100 border border-red-400 text-red-700`}
            role="alert"
          >
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Output Section */}
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
            </div>
          )}

          {generatedImage ? (
            <>
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 bg-white text-slate-700 font-semibold py-3 px-5 rounded-lg hover:bg-slate-100 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </>
          ) : null}

          {!isLoading && !generatedImage && !error && (
            <div className="text-center p-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <p>Your generated image goes here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
