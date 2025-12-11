import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  X,
  Eye,
  ChevronDown,
  MoreVertical,
  Layers,
} from "lucide-react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { formatBytes, isFilePreviewable, t, CHUNK_SIZE } from "../constants";

interface PendingFileItemProps {
  file: File;
  onRemove: () => void;
  onUpload: () => void;
  onPreview: (url: string, name: string, mime: string) => void;
  lang?: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export const PendingFileItem: React.FC<PendingFileItemProps> = ({
  file,
  onRemove,
  onUpload,
  onPreview,
  lang,
  isMenuOpen,
  onMenuToggle,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this file will be sliced
  const willBeSliced = file.size > CHUNK_SIZE;
  const totalChunks = willBeSliced ? Math.ceil(file.size / CHUNK_SIZE) : 0;

  const isPreviewable = isFilePreviewable(file.name, file.type).ok;

  useEffect(() => {
    if (isPreviewable) {
      const url = URL.createObjectURL(file);
      queueMicrotask(() => {
        setPreviewUrl(url);
      });
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isPreviewable]);

  const getExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };
  const ext = getExtension(file.name);
  const safeStyles = defaultStyles || {};
  const iconStyle = safeStyles[ext] || {};

  const handlePreviewClick = () => {
    if (previewUrl) {
      onPreview(previewUrl, file.name, file.type);
      if (isMenuOpen) onMenuToggle();
    }
  };

  const renderThumbnail = () => {
    if (previewUrl) {
      if (file.type.startsWith("image/")) {
        return (
          <img
            loading="lazy"
            src={previewUrl}
            alt="preview"
            className="w-full h-full object-cover"
          />
        );
      }
      if (file.type.startsWith("video/")) {
        return (
          <video
            preload="none"
            src={previewUrl}
            className="w-full h-full object-cover"
            muted
          />
        );
      }
    }
    return (
      <div className="w-8 h-8">
        <FileIcon extension={ext} {...iconStyle} />
      </div>
    );
  };

  const handleMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuToggle();
  };

  if (willBeSliced) {
    // Sliced file - show with expand/collapse
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700/50 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={previewUrl ? handlePreviewClick : undefined}
              className={`w-12 h-12 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 relative group/thumb ${previewUrl ? "cursor-pointer" : ""}`}
            >
              {renderThumbnail()}
              {/* Overlay Eye Icon for previewable items */}
              {previewUrl && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-1 shadow-sm">
                    <Eye className="w-3 h-3 text-telegram-600 dark:text-telegram-400" />
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                title={file.name}
              >
                {file.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded text-[11px] font-medium">
                  📦 {totalChunks} parts
                </span>
                <span>{formatBytes(file.size)}</span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Button + Upload + Remove */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-lg transition-all ${isExpanded ? "bg-orange-100 dark:bg-orange-900/40" : "bg-slate-100 dark:bg-slate-700"}`}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? "text-orange-600 dark:text-orange-400 rotate-180" : "text-slate-400"}`}
              />
            </button>
            <div className="hidden min-[480px]:flex items-center gap-1 ml-2 flex-shrink-0">
              <button
                onClick={onUpload}
                className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Upload this file"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Remove from list"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex min-[480px]:hidden items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={handleMenuButton}
              className={`p-2 rounded-lg transition-colors ${isMenuOpen ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div
                className={`absolute right-12 ${isExpanded ? "bottom-44" : "bottom-12"} mb-2 w-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={onUpload}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-400 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                  title="Upload this file"
                >
                  <UploadCloud className="w-4 h-4" /> {t(lang, "upload")}
                </button>
                <button
                  onClick={onRemove}
                  className="w-full text-left px-4 py-2.5 text-sm ext-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-3"
                  title="Remove from list"
                >
                  <X className="w-4 h-4" /> {t(lang, "delete")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="pl-4 border-l-2 border-orange-300 dark:border-orange-700 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2">
              {t(lang, "chunks")} ({totalChunks})
            </div>
            {Array.from({ length: totalChunks }).map((_, idx) => {
              const start = idx * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, file.size);
              const chunkSize = end - start;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs"
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium text-[10px]">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                      {file.name}.part{idx + 1}of{totalChunks}.
                      {file.name.split(".").pop()}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {formatBytes(chunkSize)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Non-sliced file - render normally
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg group/item hover:border-telegram-200 dark:hover:border-telegram-700 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={previewUrl ? handlePreviewClick : undefined}
          className={`w-12 h-12 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 relative group/thumb ${previewUrl ? "cursor-pointer" : ""}`}
        >
          {renderThumbnail()}
          {previewUrl && (
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
              <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-1 shadow-sm">
                <Eye className="w-3 h-3 text-telegram-600 dark:text-telegram-400" />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 text-left">
          <p
            className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate"
            title={file.name}
          >
            {file.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>{formatBytes(file.size)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
        <button
          onClick={onUpload}
          className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
          title="Upload this file only"
        >
          <UploadCloud className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
          title="Remove from list"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
