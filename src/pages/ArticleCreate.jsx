import { useState, useCallback, useMemo } from "react";
import { BsEye } from "react-icons/bs";
import {
  FiStar as Sparkles,
  FiLoader as Loader2,
  FiSearch as Search,
  FiZap as Zap,
  FiCode as Code,
  FiFileText as FileText,
} from "react-icons/fi";
import { PageHeading } from "../components/PageHeading";

// --- API Configuration and Helper Functions ---

// NOTE: The API key is assumed to be securely injected by the environment
// (or must be manually set if running locally outside of a supported sandbox).
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${API_KEY}`;

/**
 * Robust fetch wrapper with exponential backoff for API calls.
 */
const fetchWithExponentialBackoff = async (url, options, maxRetries = 5) => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429 && response.ok) {
        return response;
      }
      if (response.status === 429 && i < maxRetries - 1) {
        // console.warn(`Rate limit encountered. Retrying in ${delay / 1000}s...`); // Removed console.warn
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw new Error(
          `API request failed with status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(
          `Failed to fetch from API after ${maxRetries} attempts: ${error.message}`
        );
      }
      // console.warn(`Fetch error. Retrying in ${delay / 1000}s...`); // Removed console.warn
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- Main React Component ---

// Reverted component name to 'App' and changed export to default
export const ArticleCreate = () => {
  const [topic, setTopic] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState([]);
  // editMode can be 'view', 'edit-text', or 'edit-html'
  const [editMode, setEditMode] = useState("view");
  // This state holds either the plain text or the raw HTML, depending on editMode
  const [editingSource, setEditingSource] = useState("");

  // System instruction is unchanged: it still requests HTML from the model
  const systemInstruction = useMemo(
    () => ({
      parts: [
        {
          text: "You are a professional content writer specializing in generating engaging, well-structured, and informative blog posts. Generate a compelling blog post of approximately 400-500 words on the user's provided topic. Return **ONLY the raw content as well-formed HTML markup**, without any markdown code block delimiters (like ```html). The main title MUST be wrapped in both <h1> and <strong> tags (e.g., <h1><strong>Title Content</strong></h1>). Use `<h2>` for subheadings, and `<p>` for paragraphs. Use `<strong>` for other bold text and `<ul>`/`<li>` for lists. Ensure the content is easy to read and highly relevant to the latest public information.",
        },
      ],
    }),
    []
  );

  // Helper to clear temporary messages
  const clearMessages = useCallback(() => {
    setError("");
  }, []);

  // Helper to safely convert HTML content to Plain Text for editing
  const htmlToPlainText = useCallback((html) => {
    // Use a temporary element to safely parse and manipulate HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 1. Extract and remove the <h1> title (which includes <strong>)
    const titleElement = tempDiv.querySelector("h1");
    const title = titleElement ? titleElement.textContent.trim() : "";

    if (titleElement) {
      titleElement.remove();
    }

    // 2. Extract remaining content. Iterate through children (p, h2, ul)
    // Use double line breaks to separate structural blocks.
    const content = Array.from(tempDiv.children)
      // Replace <br> with newlines for better text editing flow
      .map((el) => {
        // Temporary fix for <br> elements not being converted to newlines
        // This is a basic way to handle common simple formatting issues.
        let text = el.outerHTML;
        text = text.replace(/<br\s*\/?>/gi, "\n");
        // Create a new div to get clean text content
        const innerDiv = document.createElement("div");
        innerDiv.innerHTML = text;
        return innerDiv.textContent.trim();
      })
      .filter((text) => text.length > 0)
      .join("\n\n");

    // 3. Combine title and content, separated by double line break
    return [title, content].filter((s) => s.length > 0).join("\n\n");
  }, []);

  // Helper to convert Plain Text back into basic HTML structure
  const plainTextToHtml = useCallback((plainText) => {
    // Split the plain text by double line breaks (a common way to denote new paragraphs/blocks)
    const blocks = plainText
      .split(/\n\s*\n/)
      .filter((block) => block.trim().length > 0);
    if (blocks.length === 0) return "";

    const title = blocks[0].trim();
    const bodyBlocks = blocks.slice(1);
    let html = "";

    // Function to safely escape text before inserting into HTML
    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // 1. Re-apply the required H1/Strong structure to the first block (Title)
    if (title) {
      const escapedTitle = escapeHtml(title);
      html += `<h1><strong>${escapedTitle}</strong></h1>`;
    }

    // 2. Wrap all subsequent blocks in <p> tags
    bodyBlocks.forEach((block) => {
      if (block.trim()) {
        const escapedBlock = escapeHtml(block.trim());
        // Simple newline handling for text that might contain soft wraps in the editor
        const contentWithBreaks = escapedBlock.replace(/\n/g, "<br/>");
        html += `<p>${contentWithBreaks}</p>`;
      }
    });

    return html;
  }, []);

  const generateBlog = useCallback(
    async (e) => {
      e.preventDefault();

      clearMessages();

      if (!topic.trim()) {
        setError("Please enter a topic to generate content.");
        return;
      }

      setIsLoading(true);
      setBlogContent("");
      setSources([]);
      setEditMode("view");
      setEditingSource("");

      const userQuery = `Write a detailed, engaging blog post about: ${topic}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ google_search: {} }],
        systemInstruction: systemInstruction,
      };

      const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      try {
        const response = await fetchWithExponentialBackoff(
          API_URL,
          fetchOptions
        );
        const result = await response.json();

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          // Content is expected to be raw HTML
          setBlogContent(candidate.content.parts[0].text);

          let extractedSources = [];
          const groundingMetadata = candidate.groundingMetadata;
          if (groundingMetadata && groundingMetadata.groundingAttributions) {
            extractedSources = groundingMetadata.groundingAttributions
              .map((attribution) => ({
                uri: attribution.web?.uri,
                title: attribution.web?.title,
              }))
              .filter((source) => source.uri && source.title);
            setSources(extractedSources);
          }
        } else {
          setError(
            "Generation failed. The API returned an invalid or empty response."
          );
          console.error("API Error Response:", result);
        }
      } catch (err) {
        console.error("API Call Error:", err);
        setError(
          `Could not connect to the generation service. Details: ${err.message}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [topic, systemInstruction, clearMessages]
  );

  // New function to handle mode changes and necessary content persistence/conversion
  const handleModeChange = useCallback(
    (newMode) => {
      // 1. Save changes if currently in an editing mode
      if (editMode === "edit-text") {
        // Convert plain text back to HTML before saving
        const newHtmlContent = plainTextToHtml(editingSource);
        setBlogContent(newHtmlContent);
      } else if (editMode === "edit-html") {
        // Raw HTML is saved directly
        setBlogContent(editingSource);
      }

      // If the new mode is 'view' OR the content is empty, clear editingSource and set mode
      if (newMode === "view" || !blogContent) {
        setEditingSource("");
        setEditMode("view");
        return;
      }

      // 2. Prepare content and set the new mode
      clearMessages();

      if (newMode === "edit-text") {
        const plainText = htmlToPlainText(blogContent);
        setEditingSource(plainText);
        setEditMode("edit-text");
      } else if (newMode === "edit-html") {
        setEditingSource(blogContent);
        setEditMode("edit-html");
      }
    },
    [
      editMode,
      editingSource,
      blogContent,
      clearMessages,
      htmlToPlainText,
      plainTextToHtml,
    ]
  );

  /**
   * Renders the blog content using dangerouslySetInnerHTML.
   */
  const ContentRenderer = ({ content }) => {
    const htmlToRender = content; // Content is assumed to be HTML

    return (
      <div
        // Enhanced Tailwind Prose Styles:
        className="prose max-w-none text-gray-700 leading-relaxed space-y-4 
                             prose-h1:font-extrabold prose-h2:font-bold prose-h1:text-indigo-800 
                             prose-h2:text-indigo-700 prose-strong:font-bold"
        dangerouslySetInnerHTML={{ __html: htmlToRender }}
      />
    );
  };

  return (
    <div className="min-h-screen sm:p-8 font-sans">
      <PageHeading
        h1={"AI Article Creator"}
        p={"Generate high-quality, up-to-date blog drafts instantly."}
      />

      <div className="max-w-4xl mx-auto">
        {/* Input and Action Section */}
        <form
          onSubmit={generateBlog}
          className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-200"
        >
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Blog Topic or Main Idea
          </label>
          <div className="flex space-x-3">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'The Future of Serverless Computing' or 'Tips for better sleep'"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
              disabled={isLoading}
              aria-label="Blog Topic"
            />
            <button
              type="submit"
              disabled={isLoading}
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
          {/* Header with Edit/View Controls */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              Generated Content
            </span>
            {blogContent && ( // Only show mode selector if content exists
              <div className="flex space-x-2 text-sm">
                {editMode !== "view" && (
                  <button
                    onClick={() => handleModeChange("view")}
                    className="flex items-center px-3 py-1 rounded-full font-medium transition duration-150 bg-green-600 text-white hover:bg-green-700 shadow-md"
                  >
                    <BsEye className="w-4 h-4 mr-1" /> Save & View
                  </button>
                )}

                <button
                  onClick={() => handleModeChange("edit-text")}
                  className={`flex items-center px-3 py-1 rounded-full font-medium transition duration-150 shadow-md ${
                    editMode === "edit-text"
                      ? "bg-indigo-700 text-white"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1" /> Edit Text
                </button>

                <button
                  onClick={() => handleModeChange("edit-html")}
                  className={`flex items-center px-3 py-1 rounded-full font-medium transition duration-150 shadow-md ${
                    editMode === "edit-html"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Code className="w-4 h-4 mr-1" /> Edit HTML
                </button>
              </div>
            )}
          </h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="mt-4 text-lg font-medium">
                Drafting the perfect post...
              </p>
            </div>
          )}

          {!isLoading && blogContent && (
            <>
              {/* RAW HTML EDIT MODE */}
              {editMode === "edit-html" && (
                <div className="p-4 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-inner min-h-[500px]">
                  <p className="text-xs text-yellow-400 font-semibold mb-2">
                    Editing Raw HTML. Ensure your tags are well-formed before
                    saving.
                  </p>
                  <textarea
                    value={editingSource}
                    onChange={(e) => setEditingSource(e.target.value)}
                    className="w-full min-h-[450px] p-4 border-none bg-gray-900 text-yellow-200 font-mono text-sm resize-y focus:outline-none"
                    placeholder="Edit your raw HTML here..."
                  />
                </div>
              )}

              {/* PLAIN TEXT EDIT MODE (with Live Preview) */}
              {editMode === "edit-text" && (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Plain Text Editor
                    </h3>
                    <textarea
                      value={editingSource}
                      onChange={(e) => setEditingSource(e.target.value)}
                      className="w-full min-h-[500px] p-4 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-base text-gray-800 bg-gray-50 resize-y transition duration-150 shadow-inner"
                      placeholder="Edit your plain text content here..."
                    />
                  </div>

                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Live Preview
                    </h3>
                    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-inner min-h-[500px]">
                      {/* Use the plainTextToHtml helper to render the current source */}
                      <ContentRenderer
                        content={plainTextToHtml(editingSource)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW MODE */}
              {editMode === "view" && <ContentRenderer content={blogContent} />}

              {/* Sources/Grounding Metadata (Only shown in View mode) */}
              {editMode === "view" && sources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Sources Referenced:
                  </h3>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    {sources.slice(0, 5).map((source, index) => (
                      <li key={index} className="truncate">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-600 underline"
                          title={source.title}
                        >
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                  {sources.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      And {sources.length - 5} more sources.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {!isLoading && !blogContent && !error && (
            <div className="text-center p-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <p>
                Enter a topic above and click 'Generate' to create your blog
                post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
