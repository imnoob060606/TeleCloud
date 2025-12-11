import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  CircleCheck,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { formatBytes, t } from "../constants";
import { DownloadTask } from "../types"; // Import DownloadTask

interface DownloadModalProps {
  isOpen: boolean;
  task: DownloadTask; // Use DownloadTask object
  lang?: string;
  onClose: () => void;
  onCancel: (taskId: string) => void; // Add onCancel prop
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  task, // Destructure task
  lang = "en",
  onClose,
  onCancel,
}) => {
  const {
    id,
    fileName,
    fileSize,
    totalChunks,
    chunkProgresses,
    overallProgress,
    status,
  } = task;
  const isDownloading = status === "downloading";

  const getExtension = (name: string) => {
    if (typeof name !== "string") return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };

  const extension = getExtension(fileName);
  const safeStyles = defaultStyles || {};
  const fileStyle = safeStyles[extension] || {};

  if (!isOpen) return null;

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
              {t(lang, "downloading")}
            </h2>
            <div className="flex items-center gap-2">
              {isDownloading && (
                <button
                  onClick={() => onCancel(id)}
                  className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  {t(lang, "cancel")}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <div className="w-8 h-8">
                  <FileIcon extension={extension} {...fileStyle} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-semibold text-slate-900 dark:text-white truncate text-sm"
                  title={fileName}
                >
                  {fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatBytes(fileSize)}
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t(lang, "progress")}
                </span>
                <span className="text-xs text-telegram-600 dark:text-telegram-400 font-mono">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-telegram-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* Chunks Progress */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {t(lang, "chunks")} ({totalChunks})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {chunkProgresses.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    {/* Chunk Number */}
                    <div className="w-7 h-7 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </div>

                    {/* Chunk Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                        {chunk.name}
                      </p>
                      <div className="mt-1 h-1 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            chunk.status === "error"
                              ? "bg-red-500"
                              : chunk.status === "completed"
                                ? "bg-green-500"
                                : "bg-telegram-500"
                          }`}
                          style={{ width: `${chunk.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className="shrink-0">
                      {chunk.status === "completed" && (
                        <CircleCheck className="w-4 h-4 text-green-500" />
                      )}
                      {chunk.status === "downloading" && (
                        <Loader2 className="w-4 h-4 text-telegram-500 animate-spin" />
                      )}
                      {chunk.status === "error" && (
                        <CircleAlert className="w-4 h-4 text-red-500" />
                      )}
                      {chunk.status === "pending" && (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Messages */}
              {chunkProgresses.some((c) => c.errorMsg) && (
                <div className="mt-4 space-y-2">
                  {chunkProgresses.map(
                    (chunk, idx) =>
                      chunk.errorMsg && (
                        <div
                          key={idx}
                          className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                        >
                          {chunk.name}: {chunk.errorMsg}
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Status Text */}
            {isDownloading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center animate-pulse">
                {t(lang, "downloading")}...
              </p>
            )}
            {status === "completed" && (
              <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                {t(lang, "download_complete")}
              </p>
            )}
            {status === "aborted" && (
              <p className="text-xs text-orange-600 dark:text-orange-400 text-center font-medium">
                {t(lang, "download_aborted")}
              </p>
            )}
            {status === "error" && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                {t(lang, "download_error")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadModal;
