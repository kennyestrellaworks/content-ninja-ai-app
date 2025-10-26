import { useState } from "react";
import { generateInstantVideo } from "../api/gradioApi";
import { PageHeading } from "../components/PageHeading";
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

export const VideoCreate = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      console.log("Attempting to generate instant video...");
      const videoUrl = await generateInstantVideo(prompt);

      if (videoUrl) {
        console.log("Video URL received:", videoUrl);
        setGeneratedVideo(videoUrl);
      } else {
        setError("Video was generated but no URL was returned.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const useExamplePrompt = () => {
    setPrompt("A beautiful sunset over mountains");
  };

  return (
    <div className="min-h-screen sm:p-8 font-sans">
      <PageHeading
        h1={"AI Video Creator"}
        p={"Generate videos instantly using SahaniJi/Instant-Video Space"}
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
            Enter your prompt
          </label>

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A beautiful moonlight over the sea"
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
              Generated Video
            </span>
          </h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="mt-4 text-lg font-medium">Creating your video...</p>
            </div>
          )}

          {generatedVideo ? (
            <div className="space-y-4">
              <video
                key={generatedVideo}
                controls
                className="w-full rounded-lg bg-black max-h-96"
                autoPlay
                loop
                muted
              >
                <source src={generatedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(generatedVideo, "_blank")}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Download
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
          {!isLoading && !generatedVideo && !error && (
            <div className="text-center p-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <p>Your generated video goes here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
