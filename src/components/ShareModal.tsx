import React, { useState, useEffect } from "react";
import {
  Share2,
  X,
  Copy,
  Check,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { t } from "@/constants";
import { AppConfig } from "@/types";
import { getPublicDownloadUrl } from "@/services/telegramService";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { id: string; name: string } | null;
  config: AppConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  file,
  config,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const lang = config.language;

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setGeneratedLink("");
      setIsCopied(false);
      setIsLoading(false);
    }
  }, [isOpen, file]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    try {
      const url = await getPublicDownloadUrl(
        config,
        file.id,
        file.name,
        password,
      );
      setGeneratedLink(url);

      // Auto copy
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Share2 className="w-5 h-5 text-telegram-500" />
            <h2 className="font-semibold text-lg">
              {t(lang, "share_button")} "{file.name}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!generatedLink ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t(lang, "enter_password_share")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-telegram-500 focus:ring-2 focus:ring-telegram-100 dark:focus:ring-telegram-900 outline-none text-sm transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1">
                  Leave blank for a public link.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-telegram-500 hover:bg-telegram-600 text-white rounded-lg font-medium shadow-lg shadow-telegram-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
                Generate Link
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200 text-sm">
                    Link Generated!
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Ready to share.
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  setGeneratedLink("");
                  setPassword("");
                }}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Generate Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
