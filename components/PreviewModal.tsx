import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Download,
  FileText,
  Eye,
  Code,
  Columns,
  Link as LinkIcon,
  Unlink,
  Copy,
  Check,
} from "lucide-react";
import { isFilePreviewable, t } from "../constants";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  coy,
} from "react-syntax-highlighter/dist/esm/styles/prism";
// import hljs from "highlight.js";
import languageMap from "language-map";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../github-markdown-modified.css"; // 你自定义的覆盖规则
import { AppConfig } from "../types";
import { downloadAndReassembleChunksWithProgress } from "../services/fileReassemblyService";
import { getFileUrl } from "../services/telegramService";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  mimeType: string;
  lang: AppConfig["language"];
  chunks?: any[]; // Array of chunks if the file is sliced
  config?: AppConfig; // Needed for generating download URLs for chunks
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  url,
  fileName,
  mimeType,
  lang,
  chunks,
  config,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [reassembledUrl, setReassembledUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [viewMode, setViewMode] = useState<"code" | "preview" | "split">(
    "code",
  );
  const [syncScroll, setSyncScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const codeScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Listen for dark mode changes
  // useEffect(() => {
  //    const observer = new MutationObserver(() => {
  //       setIsDarkMode(document.documentElement.classList.contains('dark'));
  //    });
  //    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  //    return () => observer.disconnect();
  // }, []);

  // Determine file type category
  const _isFilePreviewable = isFilePreviewable(fileName, mimeType);
  let isVideo = false;
  let isImage = false;
  let isAudio = false;
  let isPdf = false;
  let isText = false;

  switch (_isFilePreviewable.type) {
    case "video":
      isVideo = true;
      break;
    case "image":
      isImage = true;
      break;
    case "audio":
      isAudio = true;
      break;
    case "pdf":
      isPdf = true;
      break;
    case "text":
      isText = true;
      break;
  }

  const isMarkdown =
    fileName.toLowerCase().endsWith(".md") ||
    fileName.toLowerCase().endsWith(".markdown");

  // Determine Language for Syntax Highlighting
  const getLanguage = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ext;
    // let candidates: string[] = [];

    // if (ext) {
    //    candidates = [...new Set(Object.entries(languageMap)
    //       .filter(([_, info]) => 'extensions' in info && info.extensions?.includes("." + ext))
    //       .flatMap(([lang, info]) => {
    //          const base = [lang.toLowerCase()];
    //          const aliases = ('aliases' in info && info.aliases || []).map(a => a.toLowerCase());
    //          return [...base, ...aliases];
    //       }))];
    //    // // .map(([lang]) => lang.toLowerCase());
    //    // return [...new Set(matches)]; // 去重
    // }
    // if (ext && extAliasMap[ext]) {
    //    candidates = extAliasMap[ext]; // linguist 自动处理扩展名 + alias
    //    console.log('candi:',candidates);
    // }

    // 自动检测（带候选语言）
    // const result = candidates.length
    //    ? hljs.highlightAuto(textContent, candidates).language
    //    : hljs.highlightAuto(textContent).language;

    // console.log("lang: ", result);

    // // Prism supportedLanguages
    // const prismSupported = SyntaxHighlighter.supportedLanguages;
    // if (prismSupported.includes(result)) {
    //    return result;
    // }

    // const aliases: { [key: string]: string } = {
    //    'c#': 'csharp'
    // };
    // return aliases[result || ''] || result || 'text';
  };

  useEffect(() => {
    if (!isOpen || !(isText || chunks)) {
      if (!isText && !isImage && isOpen) {
        setTimeout(() => setIsLoading(false), 100);
      }
      return;
    }

    queueMicrotask(() => setIsLoading(true));
    queueMicrotask(() => setTextContent(null));

    const abortController = new AbortController();

    // Handle Sliced Files
    if (chunks && chunks.length > 0 && config) {
      queueMicrotask(() => setIsLoading(true));
      queueMicrotask(() => setLoadingStatus(t(lang, "downloading") as string));

      // Convert chunks to StoredFileChunk format if needed
      const convertedChunks = chunks.map((chunk: any) => ({
        name: chunk.name,
        fileId: chunk.file_id,
        index: chunk.index,
        total: chunks.length,
        originalName: fileName,
      }));

      downloadAndReassembleChunksWithProgress(
        convertedChunks,
        (fileId, name) => getFileUrl(config, fileId, name, true),
        (index, name, progress, status) => {
          // Optional: Detailed chunk progress
        },
        (progress) => {
          queueMicrotask(() => setLoadingProgress(progress));
          if (progress < 100) {
            queueMicrotask(() =>
              setLoadingStatus(
                `${t(lang, "downloading")} ${Math.round(progress)}%`,
              ),
            );
          } else {
            queueMicrotask(() =>
              setLoadingStatus(t(lang, "processing") as string),
            );
          }
        },
      )
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          console.log("Reassembled URL: ", objectUrl);
          queueMicrotask(() => setReassembledUrl(objectUrl));
          queueMicrotask(() => setIsLoading(false));
        })
        .catch((err) => {
          console.error("Reassembly failed", err);
          queueMicrotask(() => setLoadingStatus("Failed to load video parts"));
          // Don't set isLoading false immediately so user sees error?
          // Or set false and show error state.
        });

      return () => {
        abortController.abort();
        if (reassembledUrl) URL.revokeObjectURL(reassembledUrl);
      };
    }

    // Normal File Fetch (for Text)
    if (isText) {
      fetch(url, { signal: abortController.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load text");
          return res.text();
        })
        .then((text) => {
          // Limit preview size to avoid browser crash on huge logs
          if (text.length > 500000) {
            setTextContent(
              text.substring(0, 500000) +
                "\n\n...[File truncated for preview]...",
            );
          } else {
            setTextContent(text);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
            setTextContent("Error loading file content.");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      // Image/Video/Audio/PDF - handled by native tags, just need to wait for load events
      // But if we have reassembledUrl, we use that.
      // If not sliced, isLoading is handled by onLoad events of tags
      if (!chunks || chunks.length === 0) {
        // setTimeout(() => setIsLoading(false), 100); // Done in useEffect below or by tags
      }
    }

    return () => {
      abortController.abort();
      if (reassembledUrl) {
        URL.revokeObjectURL(reassembledUrl);
        setReassembledUrl(null);
      }
    };
  }, [isOpen, url, isText, chunks, config]);

  // Effect to handle non-text non-sliced loading state
  useEffect(() => {
    if (isOpen && !isText && (!chunks || chunks.length === 0)) {
      // Allow some time for image/video tag to start loading
      // But actually we rely on onLoad/onLoadedData
    }
  }, [isOpen, isText, chunks]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const listenersBound = useRef(false);

  // Synchronized Scrolling
  useEffect(() => {
    if (viewMode !== "split") return;

    const codeEl = codeScrollRef.current;
    const previewEl = previewScrollRef.current;
    if (!codeEl && !previewEl) return;

    const handleCodeScroll = () => {
      if (!syncScroll) return;
      if (isSyncingLeft.current) {
        isSyncingLeft.current = false;
        return;
      }
      isSyncingRight.current = true;

      const max = codeEl.scrollHeight - codeEl.clientHeight;
      const percentage = max > 0 ? codeEl.scrollTop / max : 0;

      previewEl.scrollTop =
        percentage * (previewEl.scrollHeight - previewEl.clientHeight);

      // 使用 setTimeout 确保状态重置
      setTimeout(() => {
        isSyncingRight.current = false;
      }, 0);
    };

    const handlePreviewScroll = () => {
      if (!syncScroll) return;
      if (isSyncingRight.current) {
        isSyncingRight.current = false;
        return;
      }
      isSyncingLeft.current = true;

      const max = previewEl.scrollHeight - previewEl.clientHeight;
      const percentage = max > 0 ? previewEl.scrollTop / max : 0;
      codeEl.scrollTop =
        percentage * (codeEl.scrollHeight - codeEl.clientHeight);

      // 使用 setTimeout 确保状态重置
      setTimeout(() => {
        isSyncingLeft.current = false;
      }, 0);
    };

    if (listenersBound.current) return;
    listenersBound.current = true;
    codeEl.addEventListener("scroll", handleCodeScroll);
    previewEl.addEventListener("scroll", handlePreviewScroll);

    return () => {
      listenersBound.current = false;
      codeEl.removeEventListener("scroll", handleCodeScroll);
      previewEl.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [viewMode, syncScroll, textContent]); // Re-bind if content changes (scrollHeight changes)

  const CustomPre = React.useCallback((props: any) => {
    return <div {...props} ref={codeScrollRef} />;
  }, []);

  if (!isOpen) return null;

  const handleLoad = () => setIsLoading(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-50 dark:bg-slate-900 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        {/* Header - Always on top with high z-index */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
          <h3 className="text-white/90 text-sm font-medium bg-black/60 px-3 py-2 rounded-lg backdrop-blur-md pointer-events-auto truncate max-w-[70%] shadow-lg">
            {fileName}
          </h3>
          <div className="flex gap-2 pointer-events-auto">
            <a
              href={url}
              download={fileName}
              className="p-2 bg-black/60 text-white/80 hover:text-white hover:bg-black/80 rounded-lg backdrop-blur-md transition-all shadow-lg hover:scale-105"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
            </a>
            {isMarkdown && (
              <div className="flex gap-1 bg-black/60 rounded-lg p-1 backdrop-blur-md shadow-lg items-center">
                {viewMode === "split" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSyncScroll(!syncScroll);
                      }}
                      className={`p-1.5 rounded-md transition-all ${syncScroll ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                      title={
                        syncScroll ? "Sync Scrolling On" : "Sync Scrolling Off"
                      }
                    >
                      {syncScroll ? (
                        <LinkIcon className="w-4 h-4" />
                      ) : (
                        <Unlink className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode("code");
                  }}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "code" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  title="Code View"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode("split");
                  }}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "split" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  title="Split View"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode("preview");
                  }}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "preview" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 bg-black/60 text-white/80 hover:text-white hover:bg-black/80 rounded-lg backdrop-blur-md transition-all shadow-lg hover:scale-105"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg relative bg-black mt-16 shadow-2xl">
          {/* Loading overlay - lower z-index than header */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10 bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm text-white/70">
                  {loadingStatus || t(lang, "loading_preview")}
                </p>
              </div>
            </div>
          )}

          {isVideo && (
            <video
              src={reassembledUrl || url}
              controls
              autoPlay
              className="max-w-full max-h-full outline-none"
              onLoadedData={handleLoad}
              onError={handleLoad}
            />
          )}

          {isImage && (
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              onLoad={handleLoad}
              onError={handleLoad}
            />
          )}

          {isAudio && (
            <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <p className="text-white font-medium truncate px-4">
                  {fileName}
                </p>
              </div>
              <audio
                src={url}
                controls
                className="w-full"
                onLoadedData={handleLoad}
                onError={handleLoad}
              />
            </div>
          )}

          {isPdf && (
            <iframe
              src={url}
              className="w-full h-full bg-white"
              onLoad={handleLoad}
              title="PDF Preview"
            />
          )}

          {isText && (
            <div className="w-full h-full bg-white dark:bg-slate-800 overflow-auto">
              {textContent !== null ? (
                <div className="h-full text-sm">
                  <button
                    title={t(lang, "copy") as string}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCopied(true);
                      navigator.clipboard.writeText(textContent);
                      setTimeout(() => {
                        setCopied(false);
                      }, 3000);
                    }}
                    className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md p-2 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  {copied && (
                    <div className="absolute top-14 right-4 bg-green-600 text-white text-sm px-3 py-1 rounded-lg shadow-lg animate-fade">
                      {t(lang, "copied")}
                    </div>
                  )}
                  {isMarkdown && viewMode === "preview" ? (
                    <div className="p-8 markdown-body dark:markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {textContent}
                      </ReactMarkdown>
                    </div>
                  ) : isMarkdown && viewMode === "split" ? (
                    <div className="flex h-full">
                      <div className="w-1/2 h-full overflow-auto border-r border-slate-200 dark:border-slate-700">
                        <SyntaxHighlighter
                          language={getLanguage(fileName)}
                          style={isDarkMode ? vscDarkPlus : coy}
                          customStyle={{
                            margin: 0,
                            height: "100%",
                            borderRadius: 0,
                            backgroundColor: "transparent",
                          }}
                          PreTag={CustomPre}
                          codeTagProps={{
                            style: {
                              fontSize: "15px",
                            },
                          }}
                          wrapLongLines={true}
                          showLineNumbers={true}
                        >
                          {textContent}
                        </SyntaxHighlighter>
                      </div>
                      <div
                        ref={previewScrollRef}
                        className="w-1/2 h-full overflow-auto p-8 markdown-body dark:markdown-body"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {textContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <SyntaxHighlighter
                      language={getLanguage(fileName)}
                      style={isDarkMode ? vscDarkPlus : coy}
                      customStyle={{
                        margin: 0,
                        height: "100%",
                        borderRadius: 0,
                        backgroundColor: "transparent", // Let container bg shine through or usage theme bg
                      }}
                      codeTagProps={{
                        style: {
                          fontSize: "15px",
                        },
                      }}
                      wrapLongLines={true}
                      showLineNumbers={true}
                    >
                      {textContent}
                    </SyntaxHighlighter>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-600" />
                </div>
              )}
            </div>
          )}

          {!isVideo && !isImage && !isAudio && !isPdf && !isText && (
            <div className="text-white/70 text-center p-8">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 opacity-50" />
                </div>
              </div>
              <p className="text-lg mb-2">Preview not available</p>
              <p className="text-sm text-white/50 mb-4">
                This file type cannot be previewed in the browser.
              </p>
              <a
                href={url}
                download={fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
