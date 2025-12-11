import React from "react";
import {
  X,
  Download,
  FileText,
  CircleCheck,
  CircleAlert,
  Loader2,
  ListFilter,
} from "lucide-react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { formatBytes, t } from "../constants";
import { AppConfig, DownloadTask } from "../types";

interface DownloadListModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDownloads: DownloadTask[];
  lang: string;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onCancelDownload: (id: string) => void;
}

export const DownloadListModal: React.FC<DownloadListModalProps> = ({
  isOpen,
  onClose,
  activeDownloads,
  lang,
  onClearCompleted,
  onClearAll,
  onCancelDownload,
}) => {
  if (!isOpen) return null;

  const getExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };

  const getOverallStatusIcon = (item: DownloadTask) => {
    if (item.status === "completed")
      return <CircleCheck className="w-4 h-4 text-green-500" />;
    if (item.status === "error")
      return <CircleAlert className="w-4 h-4 text-red-500" />;
    if (item.status === "aborted")
      return <X className="w-4 h-4 text-orange-500" />;
    if (item.status === "downloading")
      return <Loader2 className="w-4 h-4 text-telegram-500 animate-spin" />;
    return <Download className="w-4 h-4 text-slate-400" />;
  };

  const hasCompletedDownloads = activeDownloads.some(
    (d) => d.status === "completed",
  );
  const hasAnyDownloads = activeDownloads.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t(lang, "download_list_title")}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {activeDownloads.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t(lang, "download_list_empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeDownloads.map((item) => {
                  const extension = getExtension(item.fileName);
                  const safeStyles = defaultStyles || {};
                  const fileStyle = safeStyles[extension] || {};

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <div className="w-6 h-6">
                            <FileIcon extension={extension} {...fileStyle} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold text-slate-900 dark:text-white truncate text-sm"
                            title={item.fileName}
                          >
                            {item.fileName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {formatBytes(item.fileSize)}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {getOverallStatusIcon(item)}
                          {item.status === "downloading" && (
                            <button
                              onClick={() => onCancelDownload(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              title={t(lang, "cancel_download") as string}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {t(lang, "progress")}
                          </span>
                          <span className="text-telegram-600 dark:text-telegram-400 font-mono">
                            {Math.round(item.overallProgress)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.status === "error"
                                ? "bg-red-500"
                                : item.status === "aborted"
                                  ? "bg-orange-500"
                                  : item.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-gradient-to-r from-telegram-500 to-purple-500"
                            }`}
                            style={{ width: `${item.overallProgress}%` }}
                          />
                        </div>
                        {item.errorMsg && (
                          <p className="text-[10px] text-red-500 mt-1">
                            {item.errorMsg}
                          </p>
                        )}
                        {item.status === "aborted" && (
                          <p className="text-[10px] text-orange-500 mt-1">
                            {t(lang, "download_cancelled")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {hasAnyDownloads && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              {hasCompletedDownloads && (
                <button
                  onClick={onClearCompleted}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {t(lang, "clear_completed")}
                </button>
              )}
              <button
                onClick={onClearAll}
                className="px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                {t(lang, "clear_all")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DownloadListModal;
