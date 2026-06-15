"use client";

import { useState, useEffect } from "react";

const FEATURES = [
  {
    id: "blog-post",
    label: "Blog Post",
    icon: "📝",
    placeholder: "e.g. Write a blog post about the future of remote work",
  },
  {
    id: "email",
    label: "Email",
    icon: "📧",
    placeholder: "e.g. Write a cold outreach email to a potential client",
  },
  {
    id: "linkedin",
    label: "LinkedIn Post",
    icon: "💼",
    placeholder: "e.g. Share a lesson I learned about leadership",
  },
];

export default function WritePage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0]);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/workspaces/me")
      .then((r) => r.json())
      .then((w) => setWorkspaceId(w.workspaceId || null))
      .catch(() => setWorkspaceId(null));
  }, []);

  async function handleGenerate() {
    if (!prompt.trim() || !workspaceId) return;

    setLoading(true);
    setOutput("");
    setError("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: selectedFeature.id,
          prompt,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.upgradeRequired) {
          setError("You've reached your monthly limit. Upgrade your plan to continue.");
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI Writer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate high-quality content in seconds
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FEATURES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFeature(f)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm transition ${
                    selectedFeature.id === f.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="font-medium text-xs">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to write about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedFeature.placeholder}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || !workspaceId}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Generating...
              </>
            ) : (
              <>✦ Generate {selectedFeature.label}</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}{" "}
              {error.includes("limit") && (
                <a href="/billing" className="underline font-medium">
                  Upgrade now
                </a>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Output</span>
            {output && (
              <button
                onClick={copyOutput}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition"
              >
                Copy
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {!output && !loading && (
              <p className="text-sm text-gray-400 italic">
                Your generated content will appear here...
              </p>
            )}

            {output && (
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {output}
                {loading && (
                  <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
