import React, { useEffect, useState } from "react";
import { Github, ExternalLink, RefreshCw } from "lucide-react";

declare const __APP_VERSION__: string;

export function Footer({ lang }: { lang: string }) {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(
        "https://api.github.com/repos/Im-Not-God/TeleCloud/releases/latest",
      );
      if (res.ok) {
        const data = await res.json();
        setLatestVersion(data.tag_name); // e.g., "v0.5.0"
      }
    } catch (e) {
      console.error("Failed to check version", e);
    } finally {
      setIsChecking(false);
    }
  };

  const currentVersion = `v${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0"}`;
  const hasUpdate =
    latestVersion &&
    latestVersion.replace(/^v/, "") !== currentVersion.replace(/^v/, "");

  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Im-Not-God/TeleCloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-telegram-500 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="font-medium">GitHub</span>
          </a>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
          <span>
            With <span className="text-red-400">♥</span> by Im-Not-God
          </span>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
          <a
            href="https://github.com/Im-Not-God/TeleCloud/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-telegram-500 transition-colors"
          >
            MIT License
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="font-mono">{currentVersion}</span>
            {hasUpdate && (
              <a
                href="https://github.com/Im-Not-God/TeleCloud/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-telegram-600 dark:text-telegram-400 font-bold animate-pulse hover:text-telegram-700"
                title={`New version available: ${latestVersion}`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Update {latestVersion}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
