import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Square,
  Layers,
  FileText,
  CircleCheck,
  ArrowUpFromLine,
  CircleX,
  CircleAlert,
} from "lucide-react";
import { formatBytes, t, CHUNK_SIZE } from "../constants";
import { FileUploadStatus } from "../types";
interface UploadQueueProps {
  pendingFiles: File[];
  activeUploads: FileUploadStatus[];
  onRemovePending: (index: number) => void;
  onUploadAll: () => void;
  onUploadFile: (file: File) => void;
  onClearPending: () => void;
  onAddMoreFiles: (files: File[]) => void;
  onCancelUpload: (id: string) => void;
  onClearUpload: (id: string) => void;
  onClearCompleted: () => void;
  onPreview: (url: string, name: string, mime: string) => void;
  lang: string;
  networkSpeed: string;
}

// import { PendingFileItem } from './PendingFileItem';
export const UploadQueue: React.FC<UploadQueueProps> = ({
  pendingFiles,
  activeUploads,
  onRemovePending,
  onUploadAll,
  onUploadFile,
  onClearPending,
  onAddMoreFiles,
  onCancelUpload,
  onClearUpload,
  onClearCompleted,
  onPreview,
  lang,
  networkSpeed,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Auto-open if files are added or uploads start
  useEffect(() => {
    if (activeUploads.length > 0 && !isOpen) {
      queueMicrotask(() => setIsOpen(true));
    }
  }, [activeUploads.length]);

  if (activeUploads.length === 0) return null;

  const uploadingCount = activeUploads.filter(
    (u) => u.status === "uploading",
  ).length;
  const totalCount = activeUploads.length;
  const completedCount = activeUploads.filter(
    (u) =>
      u.status === "completed" ||
      u.status === "aborted" ||
      u.status === "error",
  ).length;

  return (
    <div
      className={`fixed bottom-0 right-0 z-40 transition-all duration-300 sm:flex sm:justify-end max-w-full sm:mr-6 transform ${isOpen ? "translate-y-0" : "translate-y-[calc(100%-3.5rem)]"}`}
    >
      {/* Mobile Bottom Sheet / Desktop Floating Card Container */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[600px]">
          {/* Header / Toggle Bar */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${uploadingCount > 0 ? "bg-telegram-100 dark:bg-telegram-900/30 text-telegram-600 dark:text-telegram-400" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}
              >
                {uploadingCount > 0 ? (
                  <UploadCloud className="w-5 h-5 animate-pulse" />
                ) : (
                  <Layers className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {uploadingCount > 0
                    ? t(lang, "uploading")
                    : t(lang, "upload_queue")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {uploadingCount > 0
                    ? `${uploadingCount} uploading • ${networkSpeed}`
                    : `${totalCount} uploaded`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop: Quick Actions in Header when collapsed */}
              {/* {!isOpen && pendingFiles.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUploadAll(); }}
                                    className="hidden sm:flex px-3 py-1.5 bg-telegram-500 hover:bg-telegram-600 text-white text-xs font-medium rounded-lg items-center gap-1.5 transition-colors"
                                >
                                    <UploadCloud className="w-3 h-3" />
                                    {t(lang, 'upload_all')}
                                </button>
                            )} */}
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-4">
            {/* Active Uploads */}
            {activeUploads.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1 gap-4">
                  <span>
                    Total: {totalCount} files
                    <br />
                    <span className="flex items-center gap-1">
                      <CircleCheck className="w-4 h-4 text-green-500" />
                      {
                        activeUploads.filter((f) => f.status === "completed")
                          .length
                      }{" "}
                      <span className="mx-1">•</span>{" "}
                      <ArrowUpFromLine className="w-4 h-4 text-blue-500" />
                      {uploadingCount} <span className="mx-1">•</span>{" "}
                      <CircleX className="w-4 h-4 text-orange-500" />
                      {
                        activeUploads.filter((f) => f.status === "aborted")
                          .length
                      }{" "}
                      <span className="mx-1">•</span>{" "}
                      <CircleAlert className="w-4 h-4 text-red-500" />
                      {activeUploads.filter((f) => f.status === "error").length}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {completedCount > 0 && (
                      <button
                        onClick={onClearCompleted}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                        title={
                          (t(lang, "clear_completed") as string) ||
                          "Clear Completed"
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t(lang, "clear_all") || "Clear All"}</span>
                      </button>
                    )}
                    <span className="text-telegram-600 dark:text-telegram-400 bg-telegram-50 dark:bg-telegram-900/30 rounded text-xs font-mono px-2 py-1">
                      {networkSpeed}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {activeUploads.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 items-center mb-2">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === "completed" && (
                            <CircleCheck className="w-3 h-3 text-green-500" />
                          )}
                          {file.status === "error" && (
                            <CircleAlert className="w-3 h-3 text-red-500" />
                          )}
                          {file.status === "aborted" && (
                            <Square className="w-3 h-3 text-orange-500 fill-current" />
                          )}

                          {file.status === "uploading" ? (
                            <button
                              onClick={() => onCancelUpload(file.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onClearUpload(file.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <span className="w-8 text-right font-mono">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ease-out ${
                            file.status === "error"
                              ? "bg-red-500"
                              : file.status === "aborted"
                                ? "bg-orange-500"
                                : file.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-gradient-to-r from-telegram-500 to-purple-500"
                          }`}
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      {file.errorMsg && (
                        <p className="text-[10px] text-red-500 mt-1">
                          {file.errorMsg}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Files */}
            {/* {pendingFiles.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1 mt-2">
                                    <span>{t(lang, 'pending_files')} ({pendingFiles.length})</span>
                                    <button onClick={onClearPending} className="text-red-500 hover:underline flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> {t(lang, 'clear_all')}
                                    </button>
                                </div>
                                {pendingFiles.map((file, i) => (
                                    <PendingFileItem
                                        key={stringToNumberHash(`${file.name}-${file.size}-${i}`)}
                                        file={file}
                                        onRemove={() => onRemovePending(i)}
                                        onUpload={() => onUploadFile(file)}
                                        onPreview={onPreview}
                                        lang={lang}
                                        isMenuOpen={activeMenuId === stringToNumberHash(`${file.name}-${file.size}-${i}`)}
                                        onMenuToggle={() => setActiveMenuId(prev => prev === stringToNumberHash(`${file.name}-${file.size}-${i}`) ? null : stringToNumberHash(`${file.name}-${file.size}-${i}`))}
                                    />
                                ))}
                            </div>
                        )} */}
          </div>

          {/* Footer Actions */}
          {/* <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="file"
                                multiple
                                className="sr-only"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        onAddMoreFiles(Array.from(e.target.files));
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <div className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                {t(lang, 'add_more')}
                            </div>
                        </label>
                        {pendingFiles.length > 0 && (
                            <button
                                onClick={onUploadAll}
                                className="flex-[2] py-2.5 bg-telegram-500 hover:bg-telegram-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-telegram-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <UploadCloud className="w-4 h-4" />
                                {t(lang, 'upload_all')}
                            </button>
                        )}
                    </div> */}
        </div>
      </div>
    </div>
  );
};
