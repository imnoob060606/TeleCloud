import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Download, File as FileIcon, Loader2, AlertCircle } from "lucide-react";
import {
  CONFIG_STORAGE_KEY,
  THEME_STORAGE_KEY,
  t,
  DEFAULT_LANG,
  sha256Base64,
} from "@/constants";
import { Footer } from "@/components/Footer";

// Helper to decode the share payload
// payload = base64(json({ w: workerUrl, f: fileId, n: fileName }))
const decodeShare = (
  shareStr: string,
): { w: string; f: string; n: string; ph?: string } | null => {
  try {
    const b64 = shareStr.replace(/-/g, "+").replace(/_/g, "/");
    // 补充填充
    const restoredBase64 = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(restoredBase64)) as string[];
    return {
      w: payload[0],
      f: payload[1],
      n: payload[2],
      ph: payload[3] || undefined,
    };
  } catch (e) {
    return null;
  }
};

export default function SharePage() {
  const [searchParams] = useSearchParams();
  const shareParam = searchParams.get("s");

  // Theme State
  type Theme = "light" | "dark" | "system";
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    // Remove quotes if they exist (JSON.stringify adds them)
    const cleanSaved = saved ? saved.replace(/"/g, "") : null;
    return (cleanSaved as Theme) || "system";
  });
  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Lang
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    return saved
      ? JSON.parse(saved).language
      : (navigator.languages?.[0] || navigator.language).split("-")[0] ||
          DEFAULT_LANG;
  });
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const result = useMemo(() => {
    if (!shareParam) {
      return { error: "Invalid share link: Missing parameters" };
    }

    const decoded = decodeShare(shareParam);
    if (!decoded || !decoded.w || !decoded.f || !decoded.n) {
      return { error: "Invalid share link: Malformed data" };
    }

    const downloadUrl = `${decoded.w.replace(/\/$/, "")}/fp?file_id=${decoded.f}&file_name=${encodeURIComponent(decoded.n)}&d=1`;

    return {
      fileInfo: {
        workerUrl: decoded.w,
        fileId: decoded.f,
        fileName: decoded.n,
        downloadUrl,
        passwordHash: decoded.ph,
      },
    };
  }, [shareParam]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.fileInfo?.passwordHash) return;

    let hash = await sha256Base64(password + result.fileInfo.fileId);

    if (hash === result.fileInfo.passwordHash) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (result.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">
          {t(language, "share_error_title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{result.error}</p>
      </div>
    );
  }

  if (!result.fileInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-telegram-500 animate-spin" />
      </div>
    );
  }

  // Password Lock Screen
  if (result.fileInfo.passwordHash && !isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-sm w-full border border-slate-100 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Password Protected
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
            This file is protected by a password.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${passwordError ? "border-red-500 focus:ring-red-200" : "border-slate-200 dark:border-slate-600 focus:ring-telegram-100"} bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 transition-all dark:text-white`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  Incorrect password
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 dark:bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
        <Footer lang={language} />
      </div>
    );
  }

  return (
    <div className="overflow-auto flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="my-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700">
        <div className="w-20 h-20 bg-telegram-50 dark:bg-telegram-900/20 text-telegram-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileIcon className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 break-all">
          {result.fileInfo.fileName}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {t(language, "share_file_label")}
        </p>

        <a
          href={result.fileInfo.downloadUrl}
          className="block w-full py-4 bg-telegram-500 hover:bg-telegram-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-telegram-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          <div className="flex items-center justify-center gap-2">
            <Download className="w-6 h-6" />
            {t(language, "share_download_button")}
          </div>
        </a>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400">
            {t(language, "share_footer_hostedVia")}
          </p>
        </div>
      </div>
      <Footer lang={language} />
    </div>
  );
}
