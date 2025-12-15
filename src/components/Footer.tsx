import React, { useEffect, useState } from "react";
import {
  Loader2,
  Check,
  ExternalLink,
  AlertCircle,
  X,
  Download,
} from "lucide-react";
import { siGithub } from "simple-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/github-markdown-modified.css";

declare const __APP_VERSION__: string;

interface ReleaseInfo {
  tag_name: string;
  html_url: string;
  body: string;
  published_at: string;
}

type CheckStatus = "idle" | "checking" | "uptodate" | "available" | "error";

export function Footer({ lang }: { lang: string }) {
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  const currentVersion = `v${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0"}`;

  useEffect(() => {
    handleCheckUpdate();
  }, []);

  const handleCheckUpdate = async (isManual = false) => {
    if (checkStatus === "checking") return;

    setCheckStatus("checking");
    if (isManual) {
      setReleaseInfo(null);
    }

    // Artificial delay to prevent flash if too fast
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const res = await fetch(
        "https://api.github.com/repos/Im-Not-God/TeleCloud/releases/latest",
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const data: ReleaseInfo = await res.json();
      const latestVersion = data.tag_name;

      if (
        latestVersion.replace(/^v/, "") !== currentVersion.replace(/^v/, "")
      ) {
        setReleaseInfo(data);
        setCheckStatus("available");
        if (isManual) setShowChangelog(true);
      } else {
        setCheckStatus("uptodate");
        setTimeout(() => setCheckStatus("idle"), 3000);
      }
    } catch (e) {
      console.error("Version check failed", e);
      setCheckStatus("error");
      setTimeout(() => setCheckStatus("idle"), 3000);
    }
  };

  return (
    <>
      <footer className="w-full mt-10 sticky top-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          {/* Left: Copyright & License */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Im-Not-God/TeleCloud"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-telegram-500 transition-colors"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="currentColor"
                aria-label="GitHub"
                dangerouslySetInnerHTML={{ __html: siGithub.svg }}
              />
              <span className="font-medium">GitHub</span>
            </a>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
            <span>
              With <span className="text-red-400">♥</span> by Im-Not-God
            </span>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
            <span>
              &copy; {new Date().getFullYear()} &middot;{" "}
              <a
                href="https://github.com/Im-Not-God/TeleCloud/blob/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-telegram-500 transition-colors underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2"
              >
                MIT License
              </a>
            </span>
          </div>

          {/* Right: Version Check */}
          <div className="flex items-center gap-3">
            {/* Current Version (Always visible) */}
            <div className="text-xs text-slate-400 font-mono">
              {currentVersion}
            </div>

            <button
              onClick={() => {
                if (checkStatus === "available") {
                  setShowChangelog(true);
                } else {
                  handleCheckUpdate(true);
                }
              }}
              disabled={checkStatus === "checking"}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium
                ${
                  checkStatus === "available"
                    ? "bg-telegram-50 dark:bg-telegram-900/20 text-telegram-600 dark:text-telegram-400 border-telegram-200 dark:border-telegram-800 hover:bg-telegram-100 dark:hover:bg-telegram-900/40 cursor-pointer animate-pulse"
                    : checkStatus === "uptodate"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 cursor-default"
                      : checkStatus === "error"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 cursor-default"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                }
              `}
            >
              {checkStatus === "idle" && <span>Check for updates</span>}

              {checkStatus === "checking" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </>
              )}

              {checkStatus === "uptodate" && (
                <>
                  <Check className="w-3 h-3" />
                  <span>Up to date</span>
                </>
              )}

              {checkStatus === "available" && releaseInfo && (
                <>
                  <ExternalLink className="w-3 h-3" />
                  <span>New: {releaseInfo.tag_name}</span>
                </>
              )}

              {checkStatus === "error" && (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Failed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Centered Changelog Modal */}
      {showChangelog && releaseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  New Version Available
                  <span className="px-2 py-1 bg-telegram-100 dark:bg-telegram-900/30 text-telegram-600 dark:text-telegram-400 text-sm rounded-lg">
                    {releaseInfo.tag_name}
                  </span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Published on{" "}
                  {new Date(releaseInfo.published_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="p-8 markdown-body dark:markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {releaseInfo.body || "*No release notes available.*"}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowChangelog(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              <a
                href={releaseInfo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-telegram-500 hover:bg-telegram-600 text-white font-bold rounded-xl shadow-lg shadow-telegram-500/20 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Update
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
