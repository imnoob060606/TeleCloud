import React, { useEffect, useState } from "react";
import { Loader2, Check, ExternalLink, AlertCircle } from "lucide-react";
import { siGithub } from "simple-icons";

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

  const handleCheckUpdate = async () => {
    if (checkStatus === "checking") return;

    setCheckStatus("checking");
    setShowChangelog(false);
    setReleaseInfo(null);

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
      } else {
        setCheckStatus("uptodate");
        // Reset to idle after 3 seconds
        setTimeout(() => setCheckStatus("idle"), 3000);
      }
    } catch (e) {
      console.error("Version check failed", e);
      setCheckStatus("error");
      setTimeout(() => setCheckStatus("idle"), 3000);
    }
  };

  return (
    <footer className="w-full mt-10 sticky top-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        {/* Left: Copyright & License */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Im-Not-God/TeleCloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2 hover:text-telegram-500 transition-colors"
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
            &copy; {new Date().getFullYear()}{" "}
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
        <div className="flex flex-col items-end gap-2 relative">
          <button
            onClick={handleCheckUpdate}
            disabled={checkStatus === "checking"}
            className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium
                            ${
                              checkStatus === "available"
                                ? "bg-telegram-50 dark:bg-telegram-900/20 text-telegram-600 dark:text-telegram-400 border-telegram-200 dark:border-telegram-800 hover:bg-telegram-100 dark:hover:bg-telegram-900/40"
                                : checkStatus === "uptodate"
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                  : checkStatus === "error"
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }
                        `}
          >
            {checkStatus === "idle" && (
              <>
                <span className="opacity-50">ver</span>
                <span>{currentVersion}</span>
              </>
            )}

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
                <span className="flex h-2 w-2 rounded-full bg-telegram-500 animate-pulse"></span>
                <span>New: {releaseInfo.tag_name}</span>
              </>
            )}

            {checkStatus === "error" && (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Check failed</span>
              </>
            )}
          </button>

          {/* Changelog Popover/Expansion */}
          {checkStatus === "available" && releaseInfo && (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-10">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h4 className="font-semibold text-slate-800 dark:text-white text-xs">
                  Update Available
                </h4>
                <span className="text-[10px] text-slate-400">
                  {new Date(releaseInfo.published_at).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 max-h-48 overflow-y-auto custom-scrollbar text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {releaseInfo.body || "No release notes available."}
              </div>
              <a
                href={releaseInfo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 text-center text-xs font-medium text-white bg-telegram-500 hover:bg-telegram-600 transition-colors"
              >
                View Release & Download
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
